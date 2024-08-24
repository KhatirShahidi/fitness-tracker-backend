import database from "../database/connection.js";

const createUsertableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
};

async function createUser(username, password, email) {
    const result = await database.query(
        "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
        [username, hashedPassword, email]
    );
    return result.rows[0];
};

async function findUserByEmail(email) {
    const result = await database.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

const userModel = { createUser, findUserByEmail, createUserTable };

export default userModel;
