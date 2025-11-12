import mongoose from "mongoose";

const certSchema = new mongoose.Schema({
  certId: { type: String, required: true, unique: true },
  hashValue: { type: String, required: true },
  txHash: { type: String, required: true },
}, { timestamps: true });

const Certificate = mongoose.model("Certificate", certSchema);
export default Certificate;
