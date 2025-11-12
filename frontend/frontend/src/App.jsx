import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import { Sun, Moon, FileCheck, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [dark]);

  return (
    <Router>
      <div className="navbar">
        <div className="nav-links">
          <Link to="/register">
            <FileCheck size={18} /> Register
          </Link>

          <Link to="/verify">
            <ShieldCheck size={18} /> Verify
          </Link>
        </div>

        <button className="toggle-btn" onClick={() => setDark(!dark)}>
          {dark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      <div className="page">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="*" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}
