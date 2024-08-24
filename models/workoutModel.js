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
};

async function logWorkout(userId, exerciseId, sets, reps, weight, workoutDate) {
    const result = await database.query(
        "INSERT INTO workout_logs (user_id, exercise_id, sets, reps, weight, workout_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [userId, exerciseId, sets, reps, weight, workoutDate]
    );
    return result.rows[0];
};

async function getUserWorkouts(userId) {
    const result = await database.query("SELECT * FROM workout_logs WHERE user_id = $1", [userId]);
    return result.rows;
};

const workoutModel = { logWorkout, getUserWorkouts, createWorkoutTable };

export default workoutModel;
