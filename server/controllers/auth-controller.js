import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password)
      return res.json({ status: false, message: "All fields are required" });
    //
    else if (password.length < 6) {
      return res.json({
        status: false,
        message: "Password must contain minimum 6 characters",
      });
    }

    //
    const user = await User.findOne({ email }).maxTimeMS(5000);

    if (user) {
      return res.json({ status: false, message: "User already exists" });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      bio,
    }).maxTimeMS(5000);

    return res.json({
      status: true,
      message: "signUp successfully",
      token: await newUser.genToken(),
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
      },
    });

    //
  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.json({ status: false, message: "All fields are required" });
    }

    const userExist = await User.findOne({ email }).maxTimeMS(5000);

    if (!userExist) {
      return res.json({ status: false, message: "User does not exist" });
    }

    const verifyPassword = await userExist.comparePassword(password);

    if (!verifyPassword) {
      return res.json({ status: false, message: "Invalid credentials" });
    }

    return res.json({
      status: true,
      message: "Login successfully",
      token: await userExist.genToken(),
      user: {
        id: userExist._id,
        fullName: userExist.fullName,
        email: userExist.email,
        profilePic: userExist.profilePic,
        bio: userExist.bio,
      },
    });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

export const checkAuth = (req, res) => {
  return res.json({ status: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;

    const id = req.user.id;
    let updateUser;

    if (!profilePic)
      updateUser = await User.findByIdAndUpdate(
        id,
        { bio, fullName },
        { new: true }
      ).maxTimeMS(5000);
    else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updateUser = await User.findByIdAndUpdate(
        id,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      ).maxTimeMS(5000);
    }

    return res.json({ status: true, user: updateUser });
    //
  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
};
