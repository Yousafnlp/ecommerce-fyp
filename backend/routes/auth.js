import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    res.json({ data: { user: user }, success: true });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", success: false });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    res.json({ data: { user: user }, success: true });
  } catch (err) {
    res.status(500).json({ error: "signin failed", success: false });
  }
});

export default router;
