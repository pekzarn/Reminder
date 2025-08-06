import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );
      register(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Reminder
          </Link>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join thousands of organized people</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                className="form-input"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-input"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`auth-submit-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
            <Link to="/" className="back-home-link">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
