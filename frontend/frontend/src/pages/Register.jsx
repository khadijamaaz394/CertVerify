import { useState } from "react";
import { ethers } from "ethers";
import crypto from "crypto-js"; 

export default function Register() {
  const [id, setId] = useState("");
  const [data, setData] = useState("");
  const [txHash, setTxHash] = useState("");
  const [hashValue, setHashValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const ABI = [
    "function registerCertificate(string certId, bytes32 hashValue) public",
    "function verifyCertificate(string certId) public view returns (bytes32)",
  ];

  const handleRegister = async () => {
    setError("");
    setTxHash("");
    setHashValue("");
    setLoading(true);

    try {
      if (!window.ethereum) throw new Error("MetaMask not detected. Please install it.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); //triggers MetaMask popup
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const hash = "0x" + crypto.SHA256(data).toString(crypto.enc.Hex);
      setHashValue(hash);

      const tx = await contract.registerCertificate(id, hash);
      await tx.wait(); // wait for confirmation

      setTxHash(tx.hash);
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Transaction failed");
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
        onClick={handleRegister}
        disabled={loading}
        style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      >
        {loading ? "Waiting for MetaMask..." : "Register via MetaMask"}
      </button>

      {txHash && (
        <div className="success-box">
          ✅ <strong>Certificate Stored On-Chain</strong>
          <br />
          <strong>Hash:</strong> {hashValue}
          <br />
          <strong>Transaction:</strong>{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        </div>
      )}

      {error && <div className="error">❌ {error}</div>}
    </div>
  );
}
