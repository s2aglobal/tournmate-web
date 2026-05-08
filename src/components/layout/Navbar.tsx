import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/auth";

export default function Navbar() {
  const { user, player } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = player
    ? player.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <img src="/assets/icon.png" alt="TournMate" />
          TournMate
        </Link>

        <div className="nav-links">
          {isHome && (
            <>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
            </>
          )}
          {!isHome && <Link to="/">Home</Link>}

          {user ? (
            <div className="nav-user">
              <div className="nav-user-avatar">{initials}</div>
              <span className="nav-user-name">
                {player?.name ?? user.email}
              </span>
              <button className="nav-signout" onClick={() => signOut()}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-cta">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
