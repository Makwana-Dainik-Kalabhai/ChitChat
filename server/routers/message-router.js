import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  markAsSeen,
  sendMessage,
} from "../controllers/message-controller.js";

const rounter = express.Router();

rounter.route("/users").get(protectRoute, getUsersForSidebar);
rounter.route("/:id").get(protectRoute, getMessages);
rounter.route("/mark/:id").put(protectRoute, markAsSeen);
rounter.route("/send/:id").post(protectRoute, sendMessage);

export default rounter;
