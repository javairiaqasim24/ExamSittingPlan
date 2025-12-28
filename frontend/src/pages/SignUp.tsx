import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { signup } from "@/lib/api";
import "../DeskMatePremium.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await signup({ name, email, password });
      if (res.data && res.data.token) {
        localStorage.setItem("auth", res.data.token);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMsg = err?.response?.data?.msg || err?.message || "Signup failed";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background gradient */}
      <div className="auth-background">
        <div className="auth-gradient-blob auth-blob-1"></div>
        <div className="auth-gradient-blob auth-blob-2"></div>
      </div>

      {/* Content */}
      <div className="auth-content">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-circle">D</div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Create Your DeskMate Account</h1>
            <p className="auth-subtitle">Join us to optimize your exam seating</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <p>{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="auth-field">
              <label htmlFor="name" className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingRight: "2.75rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-button auth-button-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/signin" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Features hint */}
        <div className="auth-hint">
          <p className="auth-hint-text">✨ Start managing exam seating like never before</p>
        </div>
      </div>
    </div>
  );
}
