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

// Add a new exercise
async function addExercise(exerciseName, exerciseType) {
  const queryText = `
        INSERT INTO exercises (exercise_name, exercise_type)
        VALUES ($1, $2)
        RETURNING *;
    `;

  const values = [exerciseName, exerciseType];

  try {
    const result = await pool.query(queryText, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding exercise:", error);
    throw error;
  }
}

// Get all exercises
async function getExercises() {
  const queryText = `
        SELECT * FROM exercises;
    `;

  try {
    const result = await pool.query(queryText);
    return result.rows;
  } catch (error) {
    console.error("Error retrieving exercises:", error);
    throw error;
  }
}

// Get a single exercise by ID
async function getExerciseById(exerciseId) {
  const queryText = `
        SELECT * FROM exercises WHERE exercise_id = $1;
    `;

  try {
    const result = await pool.query(queryText, [exerciseId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving exercise:", error);
    throw error;
  }
}

// Delete an exercise by ID
async function deleteExercise(exerciseId) {
  const queryText = `
        DELETE FROM exercises WHERE exercise_id = $1 RETURNING *;
    `;

  try {
    const result = await pool.query(queryText, [exerciseId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
}

const exerciseModel = {
  createExerciseTable,
  addExercise,
  getExercises,
  getExerciseById,
  deleteExercise,
};

export default exerciseModel;
