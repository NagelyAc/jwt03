import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authConfig from "../config/auth.config.js";

const { user: User, refreshToken: RefreshToken, ROLES } = db;

const buildAccessToken = (userId) => {
  return jwt.sign({ id: userId }, authConfig.secret, {
    expiresIn: authConfig.jwtExpiration,
  });
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);
    const normalizedRoles = roles?.length
      ? roles.filter((role) => ROLES.includes(role))
      : ["user"];

    await User.create({
      username,
      email,
      password: hashedPassword,
      roles: normalizedRoles,
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User Not found." });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    await RefreshToken.deleteMany({ userId: user._id });

    const accessToken = buildAccessToken(user._id.toString());
    const refreshToken = await RefreshToken.createToken(user);

    const authorities = user.roles.map((role) => `ROLE_${role.toUpperCase()}`);

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (!requestToken) {
    return res.status(403).json({ message: "Refresh token is required!" });
  }

  try {
    const token = await RefreshToken.findOne({ token: requestToken });

    if (!token) {
      return res.status(403).json({ message: "Refresh token is not in database!" });
    }

    if (RefreshToken.verifyExpiration(token)) {
      await RefreshToken.deleteOne({ _id: token._id });

      return res.status(403).json({
        message: "Refresh token expired. Please sign in again.",
      });
    }

    const user = await User.findById(token.userId);

    if (!user) {
      await RefreshToken.deleteOne({ _id: token._id });

      return res.status(404).json({ message: "User not found." });
    }

    const newAccessToken = buildAccessToken(token.userId.toString());
    const authorities = user.roles.map((role) => `ROLE_${role.toUpperCase()}`);

    return res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: newAccessToken,
      refreshToken: token.token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const signout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required!" });
  }

  try {
    await RefreshToken.deleteOne({ token: refreshToken });

    res.status(200).json({ message: "Signed out successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
