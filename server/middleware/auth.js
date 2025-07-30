import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = JSON.parse(req.headers.token).value;

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.json({ status: false, message: "User not found" });
    req.user = user;

    next();
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};
