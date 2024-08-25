import database from "../database/connection.js";

const createWorkoutTableSQL = `
    CREATE TABLE IF NOT EXISTS workout_logs (
        log_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        exercise_id INTEGER REFERENCES exercises(exercise_id),
        sets INTEGER,
        reps INTEGER,
        weight DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
`;

async function createWorkoutTable() {
    try {
        await database.query(createWorkoutTableSQL);
        console.log("Workout table created successfully");
    } catch (error) {
        console.error("Error creating workout table", error);
        throw error;
    }
}

const workoutModel = { createWorkoutTable };

export default workoutModel;
