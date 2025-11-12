import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <Link to="/register">Register</Link>
      <Link to="/verify">Verify</Link>
    </div>
  );
}
