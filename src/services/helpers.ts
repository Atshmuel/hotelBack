import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Request } from "express";
import { rateLimit } from "express-rate-limit";

export function getTime() {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function generateAccessToken(data: object) {
  return jwt.sign(data, config.SECRET_ACCESS, {
    expiresIn: config.ACCESS_EXPIRE_TIME,
  });
}

export function generateRefreshToken(data: object) {
  return jwt.sign(data, config.SECRET_REFRESH);
}

export function getDataFromCookie(req: Request, cookieName: string) {
  const cookie = req.cookies[cookieName];
  if (!cookie) return false;
  return jwt.decode(cookie);
}

export function tokenHasExp(req: Request, cookieName: string) {
  const cookieData = getDataFromCookie(req, cookieName)
  if (!cookieData) return false;
  if (typeof cookieData === 'string' || !('exp' in cookieData)) return false;

  const expiredAt = new Date(cookieData.exp * 1000);

  if (expiredAt < new Date()) return true;
  return false;
}

export function limiter(timeInSec: number, trys: number) {
  return rateLimit({
    windowMs: timeInSec * 1000,
    max: trys,
    message: { message: "To many request, try again in 60 sec" },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function lowerCase(word: string) {
  return word.toLowerCase();
}
