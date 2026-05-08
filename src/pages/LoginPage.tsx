import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  resetPassword,
  sendEmailVerification,
  isVerificationRequired,
} from "../services/auth";
import { useAuth } from "../hooks/useAuth";

type Tab = "login" | "signup";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshPlayer } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function afterAuth() {
    await refreshPlayer();
    navigate("/dashboard");
  }

  async function handleEmailAuth(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (tab === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "signup") {
        await signUpWithEmail(email, password);
        if (isVerificationRequired()) {
          await sendEmailVerification();
          navigate("/verify-email");
          return;
        }
      } else {
        await signInWithEmail(email, password);
      }
      await afterAuth();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password. Please check and try again.");
      } else if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists. Switch to the Log In tab.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (msg.includes("network-request-failed")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      await afterAuth();
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes("popup-closed")) {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    setError("");
    setLoading(true);
    try {
      await signInWithApple();
      await afterAuth();
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes("popup-closed")) {
        setError("Apple sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    if (!email) {
      setError("Enter your email above, then click Forgot Password.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Password reset email sent. Check your inbox.");
    } catch {
      setError("Could not send reset email. Check the email address.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome to TournMate</h1>
        <p className="auth-subtitle">
          {tab === "login"
            ? "Sign in to your account"
            : "Create your account to get started"}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
              setInfo("");
            }}
          >
            Log In
          </button>
          <button
            className={`auth-tab${tab === "signup" ? " active" : ""}`}
            onClick={() => {
              setTab("signup");
              setError("");
              setInfo("");
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert success">{info}</div>}

        <div className="social-buttons">
          <button
            className="btn-outline"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            className="btn-outline"
            onClick={handleApple}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.11 4.45-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleEmailAuth}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
            />
          </div>
          {tab === "signup" && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Log In"
                : "Create Account"}
          </button>

          {tab === "login" && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button
                type="button"
                className="btn-text"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
