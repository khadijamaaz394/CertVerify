import React, { useState, FormEvent } from "react";
import { usePublicClient } from "wagmi";
import {
  sha256,
  stringToBytes,
  type Hex,
} from "viem";
import {
  certificateStorageAbi,
  certificateStorageAddress,
} from "../utils/contract";

const ZERO_BYTES32 = ("0x" + "0".repeat(64)) as `0x${string}`;

type Metadata = {
  certId: string;
  studentName: string;
  course: string;
  institute: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  certificateType: string;
  fileCid?: string | null;
};

const Verify: React.FC = () => {
  const [certId, setCertId] = useState("");
  const [metadataCid, setMetadataCid] = useState("");

  const [storedHash, setStoredHash] = useState<Hex | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerified(null);
    setStoredHash(null);
    setMetadata(null);

    const trimmedId = certId.trim();
    const trimmedCid = metadataCid.trim();

    if (!trimmedId || !trimmedCid) {
      setError(
        "Please enter both Certificate ID and Metadata CID."
      );
      return;
    }

    if (!certificateStorageAddress) {
      setError("Contract address not configured.");
      return;
    }

    if (!publicClient) {
      setError("Public client not available.");
      return;
    }

    try {
      setLoading(true);

      // 1) Read hash from smart contract
      const onChainHash = (await publicClient.readContract({
        address: certificateStorageAddress,
        abi: certificateStorageAbi,
        functionName: "verifyCertificate",
        args: [trimmedId],
      })) as Hex;

      if (!onChainHash || onChainHash === ZERO_BYTES32) {
        setError("No certificate found for this ID.");
        setLoading(false);
        return;
      }

      setStoredHash(onChainHash);

      // 2) Fetch metadata JSON from IPFS
      const res = await fetch(
        `https://gateway.pinata.cloud/ipfs/${trimmedCid}`
      );

      if (!res.ok) {
        setError("Failed to fetch metadata from IPFS.");
        setLoading(false);
        return;
      }

      const json = (await res.json()) as Metadata;
      setMetadata(json);

      // 3) Re-hash the JSON
      const metadataString = JSON.stringify(json);
      const calculatedHash = sha256(
        stringToBytes(metadataString)
      ) as Hex;

      // 4) Compare on-chain hash vs IPFS metadata hash
      const match = calculatedHash === onChainHash;
      setVerified(match);
    } catch (err: any) {
      console.error("Verify error:", err);
      setError(
        err?.message ||
          "Verification failed. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h1 className="card-title">Verify Certificate</h1>

        <form onSubmit={handleVerify}>
          <div className="form-field">
            <label className="form-label">
              Certificate ID
            </label>
            <input
              className="input"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CERT-2025-001"
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Metadata CID (IPFS)
            </label>
            <input
              className="input"
              value={metadataCid}
              onChange={(e) => setMetadataCid(e.target.value)}
              placeholder="Paste metadata CID here"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {storedHash && (
          <div className="alert">
            <strong>On-chain Hash:</strong>{" "}
            <span className="hash-value">{storedHash}</span>
          </div>
        )}

        {verified !== null && !error && (
          <div
            className={
              verified
                ? "alert alert-success"
                : "alert alert-error"
            }
          >
            {verified
              ? "✅ Certificate is VALID (hash matches IPFS metadata)."
              : "❌ Certificate is INVALID (hash mismatch)."}
          </div>
        )}

        {metadata && verified && (
          <div className="alert alert-success">
            <strong>Metadata Details</strong>
            <p>
              <strong>Student:</strong>{" "}
              {metadata.studentName}
            </p>
            <p>
              <strong>Course:</strong> {metadata.course}
            </p>
            <p>
              <strong>Institute:</strong>{" "}
              {metadata.institute}
            </p>
            <p>
              <strong>Issuer:</strong> {metadata.issuer}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {metadata.issueDate}
            </p>
            {metadata.expiryDate && (
              <p>
                <strong>Expiry Date:</strong>{" "}
                {metadata.expiryDate}
              </p>
            )}
            <p>
              <strong>Type:</strong>{" "}
              {metadata.certificateType}
            </p>
            {metadata.fileCid && (
              <p>
                <strong>File:</strong>{" "}
                <a
                  className="hash-link"
                  href={`https://gateway.pinata.cloud/ipfs/${metadata.fileCid}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View File
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Verify;
