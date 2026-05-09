import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/auth";

function avatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export default function Navbar() {
  const { user, player } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const initials = player
    ? player.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const avatarSrc = player
    ? avatarUrl(player.name, player.avatarId ?? "adventurer")
    : null;

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate("/");
  }

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
            <div className="nav-profile-wrapper" ref={menuRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Profile menu"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt={player?.name} className="nav-avatar-img" />
                ) : (
                  <div className="nav-user-avatar">{initials}</div>
                )}
              </button>

              {menuOpen && (
                <div className="nav-dropdown">
                  {player && (
                    <div className="nav-dropdown-header">
                      {avatarSrc && (
                        <img src={avatarSrc} alt="" className="nav-dropdown-avatar" />
                      )}
                      <div>
                        <div className="nav-dropdown-name">{player.name}</div>
                        <div className="nav-dropdown-email">{player.email}</div>
                      </div>
                    </div>
                  )}
                  <div className="nav-dropdown-divider" />
                  <Link
                    to="/profile"
                    className="nav-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="nav-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="nav-dropdown-item nav-dropdown-signout"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
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
