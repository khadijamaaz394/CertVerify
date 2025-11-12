import { ethers } from "ethers";
import Certificate from "../models/Certificate.js";
import { contract } from "../blockchain/contract.js";

//REGISTER
export const register = async (req, res) => {
  try {
    const certId = (req.body.certId ?? req.body.id ?? "").trim();
    const data = (req.body.data ?? "").trim();

    if (!certId || !data)
      return res.status(400).json({ success: false, message: "ID and data required" });

    console.log("📦 Registering:", certId);

    const hashValue = ethers.keccak256(ethers.toUtf8Bytes(data));

    // Check if already exists in DB
    const existing = await Certificate.findOne({ certId });
    if (existing)
      return res.status(400).json({ success: false, message: "Certificate ID already exists" });

    // Interact with blockchain
    const tx = await contract.registerCertificate(certId, hashValue);
    const receipt = await tx.wait();

    // Save to DB
    await Certificate.create({
      certId,
      hashValue,
      txHash: receipt.hash,
    });

    console.log("✅ Certificate stored:", certId);

    return res.status(200).json({
      success: true,
      message: "Certificate stored successfully",
      hashValue,
      txHash: receipt.hash,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({
      success: false,
      message: err.reason || err.message || "Registration failed",
    });
  }
};

// VERIFY 
export const verify = async (req, res) => {
  try {
    const certId = (req.body.certId ?? req.body.id ?? "").trim();
    if (!certId)
      return res.status(400).json({ success: false, message: "Certificate ID required" });

    console.log("🔍 Verifying:", certId);

    const onChainHash = await contract.verifyCertificate(certId);

    if (!onChainHash || onChainHash === ethers.ZeroHash || /^0x0+$/.test(onChainHash)) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      storedHash: onChainHash,
    });
  } catch (err) {
    console.error("❌ Verify error:", err);
    return res.status(500).json({
      success: false,
      message: err.reason || err.message || "Verification failed",
    });
  }
};
