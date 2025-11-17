import React, {
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import { sha256, stringToBytes, type Hex } from "viem";
import {
  certificateStorageAbi,
  certificateStorageAddress,
} from "../utils/contract";
import {
  uploadFileToIPFS,
  uploadJSONToIPFS,
} from "../utils/ipfs";

type RegisterResult = {
  metadataCid: string;
  fileCid: string | null;
  storedHash: Hex;
};

const Register: React.FC = () => {
  const [certId, setCertId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [institute, setInstitute] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmedId = certId.trim();
    if (
      !trimmedId ||
      !studentName.trim() ||
      !course.trim() ||
      !institute.trim() ||
      !issuer.trim() ||
      !issueDate.trim() ||
      !certificateType.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!certificateStorageAddress) {
      setError("Contract address not configured.");
      return;
    }

    if (!publicClient) {
      setError("Public client not available. Check wagmi config.");
      return;
    }

    try {
      setLoading(true);

      // Upload file 
      let fileCid: string | null = null;
      if (file) {
        const uploaded = await uploadFileToIPFS(file);
        fileCid = uploaded.cid;
      }

      // Build metadata JSON
      const metadata = {
        certId: trimmedId,
        studentName: studentName.trim(),
        course: course.trim(),
        institute: institute.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate.trim(),
        expiryDate: expiryDate.trim() || null,
        certificateType: certificateType.trim(),
        fileCid,
      };

      // Upload metadata JSON to IPFS
      const metadataUpload = await uploadJSONToIPFS(
        metadata,
        `certificate-${trimmedId}`
      );
      const metadataCid = metadataUpload.cid;

      // Hash the metadata JSON (stringified)
      const metadataString = JSON.stringify(metadata);
      const hashValue = sha256(
        stringToBytes(metadataString)
      ) as Hex;

      // Store hash on-chain (MetaMask will pop here)
      const txHash = await writeContractAsync({
        address: certificateStorageAddress,
        abi: certificateStorageAbi,
        functionName: "registerCertificate",
        args: [trimmedId, hashValue],
      });

      // confirmation
      await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      // Save local result for UI
      setResult({
        metadataCid,
        fileCid,
        storedHash: hashValue,
      });
    } catch (err: any) {
      console.error("Register error:", err);
      const msg =
        err?.shortMessage ||
        err?.message ||
        "Registration failed. Check console.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h1 className="card-title">Register Certificate</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Certificate ID</label>
            <input
              className="input"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CERT-2025-001"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Student Name</label>
            <input
              className="input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student full name"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Course</label>
            <input
              className="input"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. Blockchain Fundamentals"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Institute</label>
            <input
              className="input"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              placeholder="e.g. XYZ University"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Issuer</label>
            <input
              className="input"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g. Exam Cell / Registrar"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Issue Date</label>
            <input
              className="input"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Expiry Date (optional)
            </label>
            <input
              className="input"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Certificate Type</label>
            <input
              className="input"
              value={certificateType}
              onChange={(e) =>
                setCertificateType(e.target.value)
              }
              placeholder="e.g. Completion / Merit / Distinction"
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Certificate File (PDF / Image)
            </label>
            <input
              className="input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onFileChange}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <strong>Certificate Stored</strong>
            <div className="hash-row">
              <span className="hash-label">Metadata CID:</span>
              <a
                className="hash-link"
                href={`https://gateway.pinata.cloud/ipfs/${result.metadataCid}`}
                target="_blank"
                rel="noreferrer"
              >
                {result.metadataCid}
              </a>
            </div>
            {result.fileCid && (
              <div className="hash-row">
                <span className="hash-label">
                  File CID:
                </span>
                <a
                  className="hash-link"
                  href={`https://gateway.pinata.cloud/ipfs/${result.fileCid}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.fileCid}
                </a>
              </div>
            )}
            <div className="hash-row">
              <span className="hash-label">Stored Hash:</span>
              <span className="hash-value">
                {result.storedHash}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Register;
