const TimeSlot = require('../models/TimeSlot');
const Session = require('../models/Session');
const Room = require('../models/Room');
const Constraint = require('../models/Constraint');
const { Queue, PriorityQueue, SeatGrid } = require('./dsa');
const { parseSessionInfo } = require('./pdfGenerator');

// Helper type creator for student tokens
function createStudentToken(sessionId, sectionId, rollNo) {
  return { sessionId, sectionId, rollNo };
}

// Build queues of students per session and a max-heap over sessions by remaining students
async function buildSessionPool(sessionIds, constraints) {
  const sessions = await Session.find({ _id: { $in: sessionIds } });

  // Each entry: { sessionId, totalRemaining, queues: [{ sectionId, queue }] }
  const entries = [];
  let globalTotal = 0;

  for (const s of sessions) {
    let total = 0;
    const queues = [];

    for (const sec of s.sections || []) {
      const q = new Queue();

      let rollNumbers = Array.isArray(sec.rollNumbers) ? sec.rollNumbers.slice() : [];
      if (rollNumbers.length === 0 && sec.studentCount && sec.studentCount > 0) {
        // Generate synthetic roll numbers if not provided
        for (let i = 1; i <= sec.studentCount; i++) {
          rollNumbers.push(`${sec.name}-${i}`);
        }
      }

      // If random roll number order is enabled, shuffle them (Fisher-Yates)
      if (constraints.rollNoOrder === 'random' || constraints.randomShuffle) {
        for (let i = rollNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = rollNumbers[i];
          rollNumbers[i] = rollNumbers[j];
          rollNumbers[j] = tmp;
        }
      }

      for (const rn of rollNumbers) {
        q.enqueue(createStudentToken(String(s._id), String(sec._id), rn));
      }

      const size = q.size();
      if (size > 0) {
        queues.push({ sectionId: String(sec._id), queue: q });
        total += size;
      }
    }

    if (total > 0) {
      entries.push({
        sessionId: String(s._id),
        totalRemaining: total,
        queues,
      });
      globalTotal += total;
    }
  }

  // Max-heap by totalRemaining
  const heap = new PriorityQueue((a, b) => a.totalRemaining - b.totalRemaining);
  for (const e of entries) {
    heap.push(e);
  }

  return {
    heap,
    totalStudents: globalTotal,
    isEmpty() {
      return this.heap.isEmpty();
    },
    /**
     * Take the next student, trying to avoid sessions in avoidSet (adjacent seats).
     * Returns { token, sessionId } or null if nothing left.
     */
    takeNext(avoidSet) {
      if (this.heap.isEmpty()) return null;

      const skipped = [];
      let chosen = null;

      while (!this.heap.isEmpty()) {
        const top = this.heap.pop();
        if (!avoidSet.has(top.sessionId) || this.heap.isEmpty()) {
          chosen = top;
          break;
        }
        skipped.push(top);
      }

      // Push back skipped entries
      for (const e of skipped) {
        this.heap.push(e);
      }

      if (!chosen) return null;

      // Round-robin over that session's section queues
      let token = null;
      for (let i = 0; i < chosen.queues.length; i++) {
        const pair = chosen.queues[i];
        if (!pair.queue.isEmpty()) {
          token = pair.queue.dequeue();
          break;
        }
      }

      if (!token) {
        // No more students in this session
        return this.takeNext(avoidSet);
      }

      chosen.totalRemaining -= 1;
      if (chosen.totalRemaining > 0) {
        this.heap.push(chosen);
      }

      return { token, sessionId: chosen.sessionId };
    },
  };
}

// Fetch global constraints (if any) for a specific user
async function getConstraints(userId) {
  const last = await Constraint.findOne({ user: userId }).sort({ createdAt: -1 });
  if (!last) {
    return {
      noAdjacentSameSession: true,
      fillOrder: 'row',
      rollNoOrder: 'sequential',
      alternateSessionsEnabled: false,
      randomShuffle: false,
      maxSessionsPerRoom: 1,
    };
  }
  // Derive normalized constraint object
  const noAdjacentSameSession =
    typeof last.noAdjacentSameSession === 'boolean'
      ? last.noAdjacentSameSession
      : !last.allowAdjacentSameSession;

  return {
    noAdjacentSameSession,
    fillOrder: last.fillOrder === 'column' ? 'column' : 'row',
    rollNoOrder: last.rollNoOrder || 'sequential',
    alternateSessionsEnabled: !!last.alternateSessionsEnabled,
    randomShuffle: !!last.randomShuffle,
    maxSessionsPerRoom: typeof last.maxSessionsPerRoom === 'number' ? last.maxSessionsPerRoom : 1,
  };
}

/**
 * Generate seating plans for a given timeslot and set of rooms.
 * Returns an array shaped for the frontend SeatingPlan type:
 * [{ id, timeSlotId, roomId, seats: Seat[][], generatedAt }]
 * 
 * Registration Number Logic:
 * - Format: SESSION-DEPT-ROLLNO (e.g., 2024-CS-01)
 * - Uses a single global roll number counter across all sections
 * - Section A starts from roll number 1
 * - Section B continues from the next number (no reset)
 * - Roll numbers are assigned sequentially as students are seated
 */
async function generatePlansForTimeSlot(timeSlotId, roomIds, userId) {
    console.log('generatePlansForTimeSlot called with:', { timeSlotId, roomIds, userId });
  const timeSlot = await TimeSlot.findOne({ _id: timeSlotId, user: userId }).populate('sessions');
  if (!timeSlot) {
    throw new Error('TimeSlot not found');
  }

  const constraints = await getConstraints(userId);

  const sessionIds = (timeSlot.sessions || []).map((s) => String(s._id || s));
  if (sessionIds.length === 0) {
    throw new Error('TimeSlot has no sessions assigned');
  }

  const rooms = await Room.find({ _id: { $in: roomIds }, user: userId });
  if (!rooms || rooms.length === 0) {
    throw new Error('No rooms found for given IDs');
  }
  
  // Verify all sessions belong to the user
  const userSessions = await Session.find({ _id: { $in: sessionIds }, user: userId });
  if (userSessions.length !== sessionIds.length) {
    throw new Error('Some sessions do not belong to the user');
  }

  // Create a map of sessionId -> { name, year } for registration number generation
  // This allows us to use actual session names and years (e.g., "FALL" with year 2024, "SPRING" with year 2025)
  const sessionMap = new Map();
  userSessions.forEach(session => {
    // Extract year from session name or use session.year if it exists, otherwise fallback to current year
    const sessionInfo = parseSessionInfo(session.name || '');
    // Use session.year if available (as number or string), otherwise parse from name
    // Convert to string for consistent formatting
    const year = session.year ? String(session.year) : sessionInfo.year;
    sessionMap.set(String(session._id), {
      name: session.name,
      year: year
    });
  });
  
  console.log('Session map created:', Array.from(sessionMap.entries()).map(([id, data]) => ({ id, name: data.name, year: data.year }))); // Use year from session name or current year

  // Global roll number counter - starts at 1, increments for each student seated
  // This ensures continuous numbering across all sections
  let globalRollNumber = 1;

  const pool = await buildSessionPool(sessionIds, constraints);
  const totalStudents = pool.totalStudents;
  const totalSeats = rooms.reduce((sum, room) => sum + room.rows * room.columns, 0);

  if (totalSeats < totalStudents) {
    throw new Error(`Not enough seats. Students: ${totalStudents}, Seats: ${totalSeats}`);
  }
  const plans = [];
  const generatedAt = new Date().toISOString();


  // --- NEW GLOBAL BALANCED SESSION ASSIGNMENT ---
  // 1. Calculate students per session
  const sessionCounts = {};
  // Use PriorityQueue's _heap property (not heap.heap)
  const heapArrRaw = pool && pool.heap && Array.isArray(pool.heap._heap) ? pool.heap._heap : [];
  for (const e of heapArrRaw) {
    sessionCounts[e.sessionId] = e.totalRemaining;
  }
  // 2. Calculate room capacity
  const roomCapacities = rooms.map(room => room.rows * room.columns);
  // 3. Assign sessions to rooms in a round-robin, maximizing mix
  let sessionIdsLeft = Object.keys(sessionCounts).filter(sid => sessionCounts[sid] > 0);
  let sessionQueue = [...sessionIdsLeft];
  let roomSessionAssignments = [];
  for (let i = 0; i < rooms.length; i++) {
    let n = Math.min(constraints.maxSessionsPerRoom, sessionQueue.length);
    let assigned = [];
    // Pick n sessions with most students left
    let sorted = sessionQueue.slice().sort((a, b) => sessionCounts[b] - sessionCounts[a]);
    for (let j = 0; j < n; j++) {
      assigned.push(sorted[j]);
    }
    roomSessionAssignments.push(assigned);
    // Decrement counts for preview (not actual assignment)
    for (let sid of assigned) {
      sessionCounts[sid] -= Math.floor(roomCapacities[i] / n);
    }
    // Remove sessions with no students left
    sessionQueue = sessionQueue.filter(sid => sessionCounts[sid] > 0);
    if (sessionQueue.length === 0) sessionQueue = Object.keys(sessionCounts).filter(sid => sessionCounts[sid] > 0);
  }

  // 4. For each room, only allow students from assigned sessions
  for (let roomIdx = 0; roomIdx < rooms.length; roomIdx++) {
    const room = rooms[roomIdx];
    const grid = new SeatGrid(String(room._id), room.rows, room.columns);
    const iterate = constraints.fillOrder === 'column'
      ? function* byColumn(rows, cols) {
          for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
              yield [r, c];
            }
          }
        }
      : function* byRow(rows, cols) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              yield [r, c];
            }
          }
        };
    const allowedSessions = new Set(roomSessionAssignments[roomIdx]);
    let sessionsInRoom = new Set();
    for (const [r, c] of iterate(grid.rows, grid.cols)) {
      const seat = grid.getSeat(r, c);
      const neighbors = grid.getNeighbors(seat);
      const neighborSessions = new Set(
        neighbors
          .map((n) => n.sessionId)
          .filter((id) => !!id)
      );
      // Diagonal constraint: avoid same session diagonally if mixing 3 or more sessions
      let diagonalSessions = new Set();
      if (roomSessionAssignments[roomIdx].length >= 3) {
        const diagonalNeighbors = grid.getDiagonalNeighbors(seat);
        diagonalSessions = new Set(
          diagonalNeighbors
            .map((n) => n.sessionId)
            .filter((id) => !!id)
        );
      }
      // Combine direct and diagonal neighbors to avoid
      let avoid = constraints.noAdjacentSameSession
        ? new Set([...neighborSessions, ...diagonalSessions])
        : new Set();
      let result = null;
      const originalTakeNext = pool.takeNext.bind(pool);
      let tries = 0;
      let foundValid = false;
      do {
        result = originalTakeNext(avoid);
        if (!result) break;
        if (allowedSessions.has(result.sessionId)) {
          // Check if this student would violate adjacency/diagonal constraint
          if (!avoid.has(result.sessionId)) {
            foundValid = true;
            break;
          }
        }
        // Try again with empty avoid set (less strict)
        result = originalTakeNext(new Set());
        tries++;
      } while (result && (!allowedSessions.has(result.sessionId) || avoid.has(result.sessionId)) && tries < 10);
      if (!foundValid) {
        // Relax: fill seat with any available student, even if it breaks the constraint
        result = originalTakeNext(new Set());
      }
      if (!result) {
        seat.isEmpty = true;
        continue;
      }
      const { token } = result;
      seat.sessionId = token.sessionId;
      seat.sectionId = token.sectionId;
      seat.studentId = token.rollNo;
      sessionsInRoom.add(token.sessionId);
      // Generate registration number: SESSION_NAME-ROLLNO (no year prefix)
      const sessionData = sessionMap.get(token.sessionId) || { name: 'GEN', year: new Date().getFullYear() };
      const sessionName = sessionData.name;
      const sessionNameNormalized = sessionName.toUpperCase().replace(/\s+/g, '').substring(0, 15);
      const rollNoStr = globalRollNumber.toString().padStart(3, '0');
      seat.registrationNumber = `${sessionNameNormalized}-${rollNoStr}`;
      if (globalRollNumber <= 3) {
        console.log(`Registration number generated: ${seat.registrationNumber} (Session: ${sessionName}, Roll: ${rollNoStr})`);
      }
      globalRollNumber++;
      seat.isEmpty = false;
    }

    const seatsView = grid.seats.map((row) =>
      row.map((seat) => ({
        row: seat.row,
        col: seat.col,
        sessionId: seat.sessionId,
        sectionId: seat.sectionId,
        studentId: seat.studentId,
        registrationNumber: seat.registrationNumber || null, // Include registration number
        isEmpty: seat.isEmpty,
      }))
    );

    plans.push({
      id: `plan-${room._id}-${Date.now()}`,
      timeSlotId: String(timeSlot._id),
      roomId: String(room._id),
      seats: seatsView,
      generatedAt,
    });
  }

  console.log('generatePlansForTimeSlot completed successfully');
  return plans;
}

module.exports = {
  generatePlansForTimeSlot,
};

