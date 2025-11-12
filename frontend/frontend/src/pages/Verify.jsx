import { useState } from "react";
import api from "../api";

export default function Verify() {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async () => {
  setResult(null);
  setNotFound(false);

  try {
    const res = await api.post("/certs/verify", { id });

    if (!res.data.storedHash || res.data.storedHash === "0x0" || /^0x0+$/.test(res.data.storedHash)) {
      setNotFound(true);
      return;
    }

    setResult(res.data.storedHash);
  } catch (error) {
    console.error("Verify error:", error);
    setNotFound(true);
  }
};

  return (
    <div className="page-container fade-in">
      <div className="card glass-card">
        <h2>Verify Certificate</h2>

        <label>Certificate ID</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter certificate ID"
        />

        <button className="glow-btn" onClick={handleVerify}>
          Verify
        </button>

        {result && (
          <div className="success-box">
            <div className="success-title">✅ Certificate Verified</div>
            <div className="success-label">Stored Hash:</div>
            <div className="hash-text">{result}</div>
          </div>
        )}

        {notFound && (
          <div className="error-box">
            ❌ Certificate not found.
          </div>
        )}
      </div>
    </div>
  );
}
