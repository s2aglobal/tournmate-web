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
      <p className="footer-copy">
        &copy; {new Date().getFullYear()} s2aglobalLLC. All rights reserved.
      </p>
    </footer>
  );
}
