import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    bio: { type: String },
  },
  { timestamps: true }
);

userSchema.pre(
  ["save", "create", "insert", "updateOne"],
  async function (next) {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  }
);

//* Generate JWT Token
userSchema.methods.genToken = async function () {
  try {
    return await jwt.sign(
      {
        id: this._id.toString(),
        email: this.email,
        fullName: this.fullName,
        profilePic: this.profilePic,
        bio: this.bio,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );

    //
  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
};

//* Compare Password
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error("Password comparison failed");
  }
};

const User = model("User", userSchema);

export default User;
