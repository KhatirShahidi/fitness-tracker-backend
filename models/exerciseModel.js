import pool from "../database/connection.js"; // Ensure the correct path to your connection file

const createExerciseTableSQL = `
    CREATE TABLE IF NOT EXISTS exercises (
        exercise_id SERIAL PRIMARY KEY,
        exercise_name VARCHAR(100) NOT NULL,
        exercise_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    ) 
`;

// Create the Exercises table
async function createExerciseTable() {
  try {
    await pool.query(createExerciseTableSQL);
    console.log("Exercises table created successfully");
  } catch (error) {
    console.error("Error creating exercises table:", error);
    throw error;
  }
}

const exerciseModel = {
  createExerciseTable,
};

export default exerciseModel;
