import database from "../database/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";

// Function to handle user registration
async function registerUser(req, res) {
  const insertUserSQL = `
    INSERT INTO users (username, password, email) 
    VALUES ($1, $2, $3) RETURNING *;`;
  const { username, password, email, confirmPassword } = req.body;

  // Check all fields are filled
  if (!username || !password || !email || !confirmPassword) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

    // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

    // Check if email is valid
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Check if email is already registered
  const selectUserSQL = `SELECT * FROM users WHERE email = $1;`;
  const user = await database.query(selectUserSQL, [email]);
  if (user.rows.length > 0) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Check if username is already taken
  const selectUserByUsernameSQL = `SELECT * FROM users WHERE username = $1;`;
  const userByUsername = await database.query(selectUserByUsernameSQL, [
    username,
  ]);
  if (userByUsername.rows.length > 0) {
    return res.status(400).json({ message: "Username already taken" });
  }

  


  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const resDb = await database.query(insertUserSQL, [
      username,
      hashedPassword,
      email,
    ]);
    const user = resDb.rows[0];
    const resData = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    };
    res.status(201).json(resData);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
}

// Function to handle user login
async function loginUser(req, res) {
  const selectUserSQL = `SELECT * FROM users WHERE email = $1;`;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const user = await database.query(selectUserSQL, [email]);
  if (user.rows.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(401).json({ message: "Invalid email format" });
  }

  const validPassword = await bcrypt.compare(password, user.rows[0].password);

  if (!validPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  try {
    const resDb = await database.query(selectUserSQL, [email]);
    const user = resDb.rows[0];
    const dbPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(password, dbPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const tokenData = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    };
    const configJWT = { expiresIn: "1h" };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, configJWT);

    const resData = {
      message: "Login successful",
      data: {
        token: token,
        userId: user.id,
        username: user.username,
        email: user.email,
      },
    };

    res.status(200).json(resData);
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
}


const authController = { registerUser, loginUser };

export default authController;
