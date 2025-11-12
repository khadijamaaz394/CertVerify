import { useState } from "react";
import api from "../api";

export default function Register() {
  const [id, setId] = useState("");
  const [data, setData] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/certs/register", { id, data });
      setResult(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed";
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Register Certificate</h2>

      <label className="label">Certificate ID</label>
      <input
        className="input"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Enter unique certificate ID"
      />

      <label className="label">Certificate Data</label>
      <textarea
        className="textarea"
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="Enter certificate details"
      />

      <button
        className="button"
        onClick={handleSubmit}
        disabled={loading}
        style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {result && (
  <div className="success-box">
    ✅ <strong>Certificate Stored On-Chain</strong>
    <br />
    <strong>Hash:</strong> {result.hashValue}
    <br />
    <strong>Transaction:</strong>{" "}
    <a
      href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
      target="_blank"
    >
      View on Explorer
    </a>
  </div>
)}


      {error && <div className="error">❌ {error}</div>}
    </div>
  );
}
