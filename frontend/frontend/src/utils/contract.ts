import type { Abi } from "viem";

export const certificateStorageAbi = [
  {
    inputs: [
      { internalType: "string", name: "certId", type: "string" },
      { internalType: "bytes32", name: "hashValue", type: "bytes32" },
    ],
    name: "registerCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "certId", type: "string" }],
    name: "verifyCertificate",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;

const addr = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!addr) {
  console.warn(
    "[CertVerify] VITE_CONTRACT_ADDRESS is not set. Contract calls will fail."
  );
}

export const certificateStorageAddress = addr as `0x${string}`;

// CertificateStorage:
// mapping(string => bytes32) public certificateHashes;
// function registerCertificate(string certId, bytes32 hashValue);
// function verifyCertificate(string certId) view returns (bytes32);