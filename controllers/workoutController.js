import workoutModel from '../models/workoutModel.js';
import userModel from '../models/userModel.js';
import database from '../database/connection.js';

// Function to add a new workout log
async function addWorkout(req, res) {
    // Extract workout data and user identifier from the request body
    const { exercise_id, sets, reps, weight } = req.body;
    const user_id = req.user_id;  // Extracted from the JWT token by middleware

    // Check if all required fields are provided
    if (!user_id || !exercise_id || sets === undefined || reps === undefined || weight === undefined) {
        return res.status(400).json({ message: 'Please provide complete workout data' });
    }

    try {
        // Check if the user_id exists in the users table
        const checkUserSQL = `SELECT * FROM users WHERE user_id = $1`;
        const userResult = await database.query(checkUserSQL, [user_id]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid user_id.' });
        }

        // Check if the exercise_id exists in the exercises table
        const checkExerciseSQL = `SELECT * FROM exercises WHERE exercise_id = $1`;
        const exerciseResult = await database.query(checkExerciseSQL, [exercise_id]);

        if (exerciseResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid exercise_id.' });
        }

        // SQL query to insert workout log
        const createWorkoutSQL = `
            INSERT INTO workout_logs (user_id, exercise_id, sets, reps, weight) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;

        // Execute the SQL query with the provided data
        const resDB = await database.query(createWorkoutSQL, [user_id, exercise_id, sets, reps, weight]);
        const newWorkout = resDB.rows[0];

        // Return the newly created workout log
        return res.status(201).json({ newWorkout });
    } catch (error) {
        console.error('Error adding workout log:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Server error, please try again later' });
        }
    }
}

// Function to get all workouts for a user
async function getWorkouts(req, res) {
    const user_id = req.user_id;
    const getWorkoutsSQL = `SELECT * FROM workout_logs WHERE user_id = $1;`;

    try {
        const resDB = await database.query(getWorkoutsSQL, [user_id]);
        const workouts = resDB.rows;
        res.status(200).json({ workouts });
    } catch (error) {
        console.error('Error retrieving workouts:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}

const workoutController = { addWorkout, getWorkouts };

export default workoutController;
