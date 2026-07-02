import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/terms">Terms &amp; Conditions</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <a href="mailto:contact@s2agloballlc.com">Contact</a>
      </div>
      <div className="footer-social">
        <a
          href="https://www.instagram.com/tournmateapp"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
          aria-label="Follow TournMate on Instagram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span>@tournmateapp</span>
        </a>
      </div>
      <p className="footer-copy">
        &copy; {new Date().getFullYear()} s2aglobalLLC. All rights reserved.
      </p>
    </footer>
  );
}
