// src/pages/Verify.tsx
import React, { useState } from "react";
import { usePublicClient } from "wagmi";
import type { Hex } from "viem";
import {
  certificateStorageAbi,
  certificateStorageAddress,
} from "../utils/contract";

const ZERO_BYTES32 = ("0x" + "0".repeat(64)) as `0x${string}`;

const Verify: React.FC = () => {
  const [certId, setCertId] = useState<string>("");

  const [storedHash, setStoredHash] = useState<Hex | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const publicClient = usePublicClient();

  const handleVerify = async () => {
    setError(null);
    setStoredHash(null);
    setNotFound(false);

    const trimmedId = certId.trim();

    if (!trimmedId) {
      setError("Please enter a Certificate ID.");
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

      const hash = (await publicClient.readContract({
        abi: certificateStorageAbi,
        address: certificateStorageAddress,
        functionName: "verifyCertificate",
        args: [trimmedId],
      })) as Hex;

      if (!hash || hash === ZERO_BYTES32) {
        setNotFound(true);
        return;
      }

      setStoredHash(hash);
    } catch (err: any) {
      console.error("Verify error:", err);
      const msg =
        err?.shortMessage ||
        err?.message ||
        "Failed to verify certificate. See console for details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h1 className="card-title">Verify Certificate</h1>

        <div className="form-field">
          <label className="form-label" htmlFor="verifyId">
            Certificate ID
          </label>
          <input
            id="verifyId"
            className="input"
            placeholder="e.g. uni-12345"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={handleVerify}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {notFound && (
          <div className="alert alert-error">
            ❌ Certificate not found.
          </div>
        )}

        {storedHash && (
          <div className="alert alert-success">
            <strong>Certificate Verified</strong>
            <div className="hash-row">
              <span className="hash-label">Stored Hash:</span>
              <span className="hash-value">{storedHash}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Verify;
