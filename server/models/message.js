import { Schema, model } from "mongoose";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
// Generate key from environment variable (must be 32 bytes)
const key = crypto.scryptSync(
  process.env.MESSAGE_ENCRYPTION_KEY || "default_32_byte_key_for_dev_12345",
  "salt",
  32
);

const messageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    image: String,
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.pre(
  ["save", "create", "insert", "insertOne", "updateOne"],
  async function (next) {
    //
    const iv = crypto.randomBytes(16); // Generate new IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(this.text, "utf8", "hex");
    encrypted += cipher.final("hex");
    // Combine IV and encrypted data with a separator
    this.text = iv.toString("hex") + "::" + encrypted;

    next();
  }
);

const Message = model("Message", messageSchema);

export default Message;
