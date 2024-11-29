import jwt from "jsonwebtoken";
import { config } from "../config/config";
import e, { CookieOptions, Request } from "express";
import { rateLimit } from "express-rate-limit";
import Stripe from "stripe";
import { Cabins } from "../interfaces/interfaces"
const stripe = new Stripe(config.SECRET_STRIPE)

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.PRODUCTION === "production",
  sameSite: process.env.PRODUCTION === "production" ? "none" : "lax",
};

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
  const cookieData = getDataFromCookie(req, cookieName);
  if (!cookieData) return false;
  if (typeof cookieData === "string" || !("exp" in cookieData)) return false;

  const expiredAt = new Date(cookieData.exp * 1000);

  if (expiredAt < new Date()) return true;
  return false;
}

export function limiter(timeInSec: number, trys: number, role?: string) {
  return rateLimit({
    windowMs: timeInSec * 1000,
    max: role === config.ROLE.OWNER ? 99999 : trys,
    message: { message: `To many request, try again in ${timeInSec} sec` },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function lowerCase(word: string) {
  return word.toLowerCase();
}
export async function createProduct(name: string, unitPrice: number, discount: number, description: string) {
  try {
    const product = await stripe.products.create({
      name,
      description
    })
    await stripe.prices.create({ unit_amount: unitPrice * 100 - discount * 100, currency: 'usd', product: product.id, active: true })
    return product.id
  } catch (error) {
    throw new Error(error)
  }
}

export async function getProduct(id: string) {
  try {
    const product = await stripe.products.retrieve(id)
    return product
  } catch (error) {
    throw new Error(error)
  }
}

export async function deleteProduct(id: string) {
  try {
    const prices = await stripe.prices.list({ product: id })
    for (const price of prices.data) {
      await stripe.prices.update(price.id, { active: false })
    }
    await stripe.products.update(id, { active: false })
    return true
  } catch (error) {
    return false
  }
}

async function updateProductName(id: string, name: string, description: string) {
  try {
    await stripe.products.update(id, { name, description })
    return true
  } catch (error) {
    return false
  }
}

async function updateProductPrice(id: string, price: number, discount: number) {
  try {
    const newPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: price * 100 - discount * 100,
      product: id,
      active: true,
    })

    const oldPrices = await stripe.prices.list({ product: id })
    for (const price of oldPrices.data) {
      if (price.id !== newPrice.id && price.active) {
        await stripe.prices.update(price.id, { active: false })
      }
    }
    return true
  } catch (error) {
    return false
  }
}

export async function updateProduct(id: string, name: string, description: string, price: number, discount: number, oldPrice: number, oldDiscount: number) {
  if (!name.trim().length) return false
  const updatedName = await updateProductName(id, name, description)
  if (!updatedName || price <= 0 || price - discount === oldPrice - oldDiscount) return updatedName
  const updatedPrice = await updateProductPrice(id, price, discount)
  return updatedName && updatedPrice
}

export async function createPaymentSession(cabinData: Cabins, quantity: number) {
  try {
    const productPrice = (await stripe.prices.list({ product: cabinData.productId })).data.at(0)
    if (!productPrice) {
      throw new Error("Price not found for the product");
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: productPrice.id,
          quantity
        }
      ],
      success_url: "http://localhost:3000/cabins/thankyou",
      cancel_url: "http://localhost:3000/cabins/cancel"
    })
    return session
  } catch (error) {
    throw new Error(error.message || "Failed to create payment session");

  }
}
export async function checkPayment(sId:string){
  const session = await stripe.checkout.sessions.retrieve(sId)
  if(session.payment_status === 'paid'){
    return true
  }else false
}