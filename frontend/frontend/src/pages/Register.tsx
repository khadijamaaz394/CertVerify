import React, { useState } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import { sha256, stringToBytes, type Hex } from "viem";
import {
  certificateStorageAbi,
  certificateStorageAddress,
} from "../utils/contract";

type RegisterResult = {
  hashValue: Hex;
  txHash: Hex;
};

const Register: React.FC = () => {
  const [certId, setCertId] = useState<string>("");
  const [certData, setCertData] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResult | null>(null);

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const handleRegister = async () => {
    setError(null);
    setResult(null);

    const trimmedId = certId.trim();
    const trimmedData = certData.trim();

    if (!trimmedId || !trimmedData) {
      setError("Please fill in both Certificate ID and Certificate Data.");
      return;
    }

    if (!certificateStorageAddress) {
      setError("Contract address is not configured.");
      return;
    }

    if (!publicClient) {
      setError("Public client not available. Check wagmi configuration.");
      return;
    }

    try {
      setLoading(true);

      const hashValue = sha256(stringToBytes(trimmedData));

      const txHash = await writeContractAsync({
        abi: certificateStorageAbi,
        address: certificateStorageAddress,
        functionName: "registerCertificate",
        args: [trimmedId, hashValue],
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });

      setResult({ hashValue, txHash });
    } catch (err: any) {
      console.error("Register error:", err);
      const msg =
        err?.shortMessage ||
        err?.message ||
        "Transaction failed. See console for details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h1 className="card-title">Register Certificate</h1>

        <div className="form-field">
          <label className="form-label" htmlFor="certId">
            Certificate ID
          </label>
          <input
            id="certId"
            className="input"
            placeholder="e.g. uni-12345"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="certData">
            Certificate Data
          </label>
          <textarea
            id="certData"
            className="textarea"
            placeholder="e.g. Name, degree, year..."
            value={certData}
            onChange={(e) => setCertData(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={handleRegister}
        >
          {loading ? "Registering…" : "Register"}
        </button>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <strong>Certificate Stored On-Chain</strong>
            <div className="hash-row">
              <span className="hash-label">Hash:</span>
              <span className="hash-value">{result.hashValue}</span>
            </div>
            <div className="hash-row">
              <span className="hash-label">Tx:</span>
              <a
                className="hash-link"
                href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on Etherscan
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Register;
