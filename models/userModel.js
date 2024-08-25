import database from "../database/connection.js";
import bcrypt from "bcryptjs";

const createUsertableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        isAdmin BOOLEAN DEFAULT FALSE
    );
`;

async function createUserTable() {
  try {
    await database.query(createUsertableSQL);
    console.log("User table created successfully");
  } catch (error) {
    console.error("Error creating user table", error);
    throw error;
  }
}

async function findUserByUserId(req, res) {
  const selectUserSQL = `SELECT * FROM users WHERE user_id = $1;`;

  try {
    const resDB = await database.query(selectUserSQL, [req.body.user_id]);
    const user = resDB.rows[0];
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
}

const userModel = {
  createUserTable,
  findUserByUserId,
};

export default userModel;
