import { useState } from "react";
import { ethers } from "ethers";

export default function Verify() {
  const [id, setId] = useState("");
  const [storedHash, setStoredHash] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  const ABI = [
    "function registerCertificate(string certId, bytes32 hashValue) public",
    "function verifyCertificate(string certId) public view returns (bytes32)",
  ];

  const handleVerify = async () => {
    setStoredHash("");
    setNotFound(false);
    setLoading(true);

    try {
      if (!window.ethereum) throw new Error("MetaMask not detected.");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const hashValue = await contract.verifyCertificate(id);

      // If hashValue is 0x0, no certificate exists
      if (
        !hashValue ||
        hashValue === "0x" ||
        hashValue === "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStoredHash(hashValue);
    } catch (error) {
      console.error("Verification error:", error);
      setNotFound(true);
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2 className="title">Verify Certificate</h2>

      <label className="label">Certificate ID</label>
      <input
        className="input"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="Enter certificate ID"
      />

      <button
        className="button"
        onClick={handleVerify}
        disabled={loading}
        style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {storedHash && (
        <div className="success-box">
          ✅ <strong>Certificate Verified</strong>
          <br />
          <strong>Stored Hash:</strong> {storedHash}
        </div>
      )}

      {notFound && (
        <div className="error">
          ❌ Certificate not found.
        </div>
      )}
    </div>
  );
}
