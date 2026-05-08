import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendEmailVerification,
  reloadCurrentUser,
  needsEmailVerification,
} from "../services/auth";
import { signOut } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await sendEmailVerification();
      setInfo("Verification email sent! Check your inbox (and spam folder).");
    } catch {
      setError("Could not send verification email. Please wait a moment and try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleCheckVerification() {
    setError("");
    setInfo("");
    setChecking(true);
    try {
      const refreshedUser = await reloadCurrentUser();
      if (refreshedUser && !needsEmailVerification(refreshedUser)) {
        navigate("/profile-setup", { replace: true });
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch {
      setError("Could not check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>&#x2709;&#xFE0F;</div>
        <h1>Verify Your Email</h1>
        <p className="auth-subtitle">
          We sent a verification link to
        </p>
        <p style={{
          fontWeight: 700,
          color: "var(--dark-navy)",
          fontSize: "1.05rem",
          marginBottom: 24,
        }}>
          {user?.email}
        </p>
        <p style={{
          fontSize: "0.9rem",
          color: "var(--gray-500)",
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Click the link in the email to verify your account, then come back here
          and tap the button below.
        </p>

        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert success">{info}</div>}

        <button
          className="btn-primary"
          onClick={handleCheckVerification}
          disabled={checking}
          style={{ marginBottom: 12 }}
        >
          {checking ? "Checking..." : "I've Verified My Email"}
        </button>

        <button
          className="btn-outline"
          onClick={handleResend}
          disabled={resending}
          style={{ marginBottom: 24 }}
        >
          {resending ? "Sending..." : "Resend Verification Email"}
        </button>

        <button
          type="button"
          className="btn-text"
          onClick={handleSignOut}
        >
          Use a different account
        </button>
      </div>
    </div>
  );
}
