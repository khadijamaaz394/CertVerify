import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ABI = [
  "function registerCertificate(string certId, bytes32 hashValue) public",
  "function verifyCertificate(string certId) public view returns (bytes32)"
];

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  ABI,
  wallet
);
