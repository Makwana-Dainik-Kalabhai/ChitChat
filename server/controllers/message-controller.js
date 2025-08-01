import User from "../models/user.js";
import Message from "../models/message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
// Generate key from environment variable (must be 32 bytes)
const key = crypto.scryptSync(
  process.env.MESSAGE_ENCRYPTION_KEY || "default_32_byte_key_for_dev_12345",
  "salt",
  32
);

const decryptMessage = (messages) => {
  const newMessages = Array.isArray(messages) ? messages : [messages];

  for (let msg of newMessages) {
    try {
      // Split the IV and encrypted data
      const [ivHex, encryptedData] = msg.text.split("::");

      if (!ivHex || !encryptedData) {
        throw new Error("Invalid encrypted text format");
      }

      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");
      msg.text = decrypted;

      //
    } catch (err) {
      console.error("Error decrypting message:", err);
    }
  }

  return newMessages;
};

//! ------------------------------------------------------------------------------
//! All Controllers
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filterdUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    ).maxTimeMS(50000);

    //* Count no. of msgs not seen
    const unseenMessages = {};

    const promises = filterdUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      }).maxTimeMS(50000);

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);
    return res.json({
      status: true,
      users: filterdUsers,
      unseenMessages,
    });

    //
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

//* Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    let messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }).maxTimeMS(50000);

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    ).maxTimeMS(50000);

    return res.json({ status: true, messages: decryptMessage(messages) });
    //
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

//* Mark msg as seen
export const markAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndUpdate({ id }, { seen: true }).maxTimeMS(50000);

    return res.json({ status: true, message: "Message marked as seen" });

    //
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

//* Send message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text !== undefined ? text : "",
      image: imageUrl,
    }).maxTimeMS(50000);

    // Emit the new msg to the receiver
    if (userSocketMap[receiverId]) {
      io.to(userSocketMap[receiverId]).emit("newMessage", newMessage);
    }

    return res.json({
      status: true,
      newMessage: decryptMessage(newMessage)[0],
    });

    //
  } catch (error) {
    console.log(error.message);
    return res.json({ status: false, message: error.message });
  }
};
