import React from "react";
import { CheckCircle, Zap, Shield, BarChart3, Users, Clock, ArrowRight, Smartphone, Lock, RefreshCw, TrendingUp, Award, Smile } from "lucide-react";
import "../DeskMatePremium.css";

const HomePage: React.FC = () => {
  return (
    <>
      <header className="header-startup navbar-glass header-prominent">
        <div className="container header-flex nav-justified">
          <div className="logo startup-logo logo-prominent">
            <div className="logo-icon logo-icon-prominent">D</div>
            <span className="logo-text-prominent">DeskMate</span>
          </div>
          <nav className="main-nav nav-minimal">
            <div className="nav-buttons">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="/signin" className="btn btn-secondary btn-nav-minimal">Sign In</a>
              <a href="/signup" className="btn btn-primary btn-nav-primary">Get Started</a>
            </div>
          </nav>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-banner-background">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
        </div>
        <div className="hero-banner-content">
          <h1 className="hero-banner-title fade-in-up" style={{ animationDelay: "0.05s" }}>
            Exam Seating Made <span className="gradient-text">Intelligent</span>
          </h1>
          <p className="hero-banner-tagline fade-in-up" style={{ animationDelay: "0.1s" }}>
            Generate perfect seating arrangements in seconds. Prevent cheating, optimize space, eliminate conflicts.
          </p>
          <div className="hero-banner-buttons fade-in-up" style={{ animationDelay: "0.15s" }}>
            <a href="/signup" className="btn btn-primary btn-hero btn-hero-primary">
              <span>Start Free Trial</span>
              <ArrowRight size={18} />
            </a>
            <a href="#demo" className="btn btn-secondary btn-hero">
              <span>Watch Demo</span>
            </a>
          </div>
          <p className="hero-subtext fade-in-up" style={{ animationDelay: "0.2s" }}>
            No credit card required • Full access for 30 days
          </p>
        </div>
      </section>

      <div className="container">
        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-header fade-in-left">
            <h2 className="section-title">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="section-subtitle">
              Everything you need to manage exam seating efficiently and at scale.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-card-animate glass-card">
              <div className="feature-icon icon-blue">
                <Zap size={32} />
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-desc">Generate seating plans for thousands of students in milliseconds.</p>
              <div className="feature-benefit">✓ Real-time optimization</div>
            </div>

            <div className="feature-card feature-card-animate glass-card" style={{ animationDelay: "0.1s" }}>
              <div className="feature-icon icon-teal">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">Cheat Prevention</h3>
              <p className="feature-desc">Smart algorithms prevent same-section students from sitting together.</p>
              <div className="feature-benefit">✓ Advanced conflict detection</div>
            </div>

            <div className="feature-card feature-card-animate glass-card" style={{ animationDelay: "0.2s" }}>
              <div className="feature-icon icon-purple">
                <BarChart3 size={32} />
              </div>
              <h3 className="feature-title">Analytics & Reports</h3>
              <p className="feature-desc">Get insights into efficiency, utilization, and distribution patterns.</p>
              <div className="feature-benefit">✓ PDF export ready</div>
            </div>

            <div className="feature-card feature-card-animate glass-card" style={{ animationDelay: "0.3s" }}>
              <div className="feature-icon icon-green">
                <Users size={32} />
              </div>
              <h3 className="feature-title">Bulk Management</h3>
              <p className="feature-desc">Handle hundreds of exams and multiple sessions with ease.</p>
              <div className="feature-benefit">✓ Batch processing</div>
            </div>

            <div className="feature-card feature-card-animate glass-card" style={{ animationDelay: "0.4s" }}>
              <div className="feature-icon icon-orange">
                <Smartphone size={32} />
              </div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-desc">Access and manage plans from any device, anywhere, anytime.</p>
              <div className="feature-benefit">✓ Responsive design</div>
            </div>

            <div className="feature-card feature-card-animate glass-card" style={{ animationDelay: "0.5s" }}>
              <div className="feature-icon icon-pink">
                <RefreshCw size={32} />
              </div>
              <h3 className="feature-title">Easy Adjustments</h3>
              <p className="feature-desc">Drag-and-drop interface for manual changes with full undo support.</p>
              <div className="feature-benefit">✓ Intuitive controls</div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="steps-section">
          <div className="section-header fade-in-left">
            <h2 className="section-title">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="section-subtitle">
              Three simple steps to transform exam planning chaos into clarity.
            </p>
          </div>

          <div className="steps-wrapper">
            <div className="step step-animate glass-card">
              <div className="step-badge">1</div>
              <div className="step-icon">📤</div>
              <h3 className="step-title">Upload & Configure</h3>
              <p className="step-desc">Define exams, students, rooms, timeslots, and constraints in minutes.</p>
            </div>

            <div className="step-arrow">
              <ArrowRight size={24} />
            </div>

            <div className="step step-animate glass-card" style={{ animationDelay: "0.2s" }}>
              <div className="step-badge">2</div>
              <div className="step-icon">⚡</div>
              <h3 className="step-title">DSA Powered</h3>
              <p className="step-desc">Advanced data structures optimize conflict resolution and seating instantly.</p>
            </div>

            <div className="step-arrow">
              <ArrowRight size={24} />
            </div>

            <div className="step step-animate glass-card" style={{ animationDelay: "0.4s" }}>
              <div className="step-badge">3</div>
              <div className="step-icon">✓</div>
              <h3 className="step-title">Review & Deploy</h3>
              <p className="step-desc">Verify results, make adjustments, and export PDFs instantly.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer-full">
        <div className="footer-content-full">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">D</div>
              DeskMate
            </div>
            <p className="footer-tagline">
              Intelligent Exam Seating Platform<br />
              Streamline your exam planning process
            </p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#demo">Live Demo</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <div className="footer-links">
              <a href="/">About</a>
              <a href="/">Blog</a>
              <a href="/">Contact</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="footer-links">
              <a href="mailto:hello@deskmate.com">hello@deskmate.com</a>
              <a href="https://github.com/deskmate" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://twitter.com/deskmate" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom-full">
          <div>© 2025 DeskMate. All rights reserved. Making exam planning intelligent.</div>
          <div className="footer-links-bottom">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Service</a>
            <a href="/">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
