
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const SALT_ROUNDS = 12;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
  role: "brand" | "creator";
}) {
  const email = input.email.trim().toLowerCase();

  const existingUser = await User.exists({ email });

  if (existingUser) {
    throw Object.assign(new Error("Email is already registered"), {
      statusCode: 409,
    });
  }

  const hashedPassword = await bcrypt.hash(
    input.password,
    SALT_ROUNDS,
  );

  const user = await User.create({
    name: input.name.trim(),
    email,
    password: hashedPassword,
    role: input.role,
  });

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password");

  if (
    !user ||
    !(await bcrypt.compare(input.password, user.password))
  ) {
    throw Object.assign(new Error("Invalid email or password"), {
      statusCode: 401,
    });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
