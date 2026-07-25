const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user in DB
    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      fullName,
      role
    });

    // 4. Generate token and respond
    const token = generateToken(newUser);
    res.status(201).json({
      user: newUser,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Generate token (strip password_hash from response)
    const { password_hash, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    res.status(200).json({
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user is populated by the authMiddleware
    const user = await UserModel.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};