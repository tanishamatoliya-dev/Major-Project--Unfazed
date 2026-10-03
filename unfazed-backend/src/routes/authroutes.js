const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Therapist = require("../models/therapist");

const router = express.Router();

// Helper to make URL slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if therapist exists
    const existing = await Therapist.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create unique slug
    let baseSlug = generateSlug(name) || "therapist";
    let slug = baseSlug;
    let count = 1;
    while (await Therapist.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const newTherapist = new Therapist({
      name: name.trim(),
      email: cleanEmail,
      password_hash,
      slug,
      bio: bio || "",
    });

    await newTherapist.save();

    return res.status(201).json({
      message: "Therapist registered successfully!",
      therapist: {
        id: newTherapist._id,
        name: newTherapist.name,
        email: newTherapist.email,
        slug: newTherapist.slug,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: error.message || "Registration failed on server." });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const therapist = await Therapist.findOne({ email: cleanEmail });

    if (!therapist) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, therapist.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: therapist._id, slug: therapist.slug },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful!",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: error.message || "Login failed on server." });
  }
});

// 3. GET PROFILE BY SLUG
router.get("/profile/:slug", async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ slug: req.params.slug }).select("-password_hash");

    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found." });
    }

    return res.json(therapist);
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ message: error.message || "Server error loading profile." });
  }
});

module.exports = router;