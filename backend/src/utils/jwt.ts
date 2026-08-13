import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_this_secret";

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};
