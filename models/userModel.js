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



const userModel = {
  createUserTable,
};

export default userModel;

