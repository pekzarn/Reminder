import { Link } from "react-router-dom";
import "../styles/Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="header">
        <Link to="/" className="logo">
          Reminder
        </Link>
        <nav className="nav-buttons">
          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Main Landing Content */}
      <main className="landing-page">
        <div className="bg-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Never Forget
            <br />
            What Matters
          </h1>
          <p className="hero-subtitle">
            Simple, elegant reminders that keep you on track. Because life's too
            important to leave to memory.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-hero">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-hero">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
