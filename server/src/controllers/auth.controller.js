import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const REFRESH_COOKIE_NAME = "refreshToken";

function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function buildAccessToken(user) {
  return signAccessToken({ sub: user._id.toString(), role: user.role, email: user.email });
}

async function persistRefreshToken(userId, jti, days = 7) {
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user: userId, jti, expiresAt });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email y password son obligatorios" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email ya registrado" });

  const user = await User.create({ name, email, password });

  const accessToken = buildAccessToken(user);
  const jti = uuidv4();
  const refreshToken = signRefreshToken({ sub: user._id.toString(), jti });
  await persistRefreshToken(user._id, jti);

  res
    .cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
    .status(201)
    .json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const valid = await user.comparePassword(password);
  if (!valid) return res.status(401).json({ message: "Credenciales inválidas" });

  const accessToken = buildAccessToken(user);
  const jti = uuidv4();
  const refreshToken = signRefreshToken({ sub: user._id.toString(), jti });
  await persistRefreshToken(user._id, jti);

  res
    .cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
    .json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken });
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = verifyRefreshToken(token);
    const tokenDoc = await RefreshToken.findOne({ jti: decoded.jti, user: decoded.sub });
    if (!tokenDoc || tokenDoc.revoked) return res.status(401).json({ message: "Refresh inválido" });

    tokenDoc.revoked = true;
    await tokenDoc.save();

    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ message: "Usuario no existe" });

    const accessToken = buildAccessToken(user);
    const jti = uuidv4();
    const newRefresh = signRefreshToken({ sub: user._id.toString(), jti });
    await persistRefreshToken(user._id, jti);

    res.cookie(REFRESH_COOKIE_NAME, newRefresh, refreshCookieOptions()).json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Refresh inválido/expirado" });
  }
}

export async function logout(_req, res) {
  const token = _req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await RefreshToken.updateOne({ jti: decoded.jti, user: decoded.sub }, { $set: { revoked: true } });
    } catch (_) {}
  }
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  return res.json({ message: "Logout ok" });
}

export async function me(req, res) {
  res.json({ user: req.user });
}