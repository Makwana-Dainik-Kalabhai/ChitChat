import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from "../controllers/auth-controller.js";
import { protectRoute } from "../middleware/auth.js";

const rounter = express.Router();

rounter.route("/signup").post(signup);

rounter.route("/login").post(login);

rounter.route("/update-profile").put(protectRoute, updateProfile);

rounter.route("/check").get(protectRoute, checkAuth);

export default rounter;
