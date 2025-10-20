// src/utils/jwt.js
import "dotenv/config";
import jwt from "jsonwebtoken";

function ensure(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `[JWT] Falta variable de entorno ${name}. Verifica tu .env y que dotenv se cargue antes.`
    );
  }
  return v;
}

export function signAccessToken(payload) {
  const secret = ensure("JWT_ACCESS_SECRET");
  const exp = process.env.JWT_ACCESS_EXPIRES || "15m";
  return jwt.sign(payload, secret, { expiresIn: exp });
}

export function signRefreshToken(payload) {
  const secret = ensure("JWT_REFRESH_SECRET");
  const exp = process.env.JWT_REFRESH_EXPIRES || "7d";
  return jwt.sign(payload, secret, { expiresIn: exp });
}

export function verifyAccessToken(token) {
  const secret = ensure("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = ensure("JWT_REFRESH_SECRET");
  return jwt.verify(token, secret);
}
