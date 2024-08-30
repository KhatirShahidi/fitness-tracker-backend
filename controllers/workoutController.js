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
    
    // SQL query to join workout_logs with exercises to get exercise_name
    const getWorkoutsSQL = `
        SELECT wl.log_id, wl.user_id, wl.sets, wl.reps, wl.weight, wl.created_at, e.exercise_name
        FROM workout_logs wl
        JOIN exercises e ON wl.exercise_id = e.exercise_id
        WHERE wl.user_id = $1;
    `;

    try {
        const resDB = await database.query(getWorkoutsSQL, [user_id]);
        const workouts = resDB.rows;  // Rows now include exercise_name
        res.status(200).json({ workouts });
    } catch (error) {
        console.error('Error retrieving workouts:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}


async function editWorkout(req, res) {
    const { log_id } = req.params;
    const { exercise_id, sets, reps, weight } = req.body;
    const user_id = req.user_id;

    const editWorkoutSQL = `
        UPDATE workout_logs
        SET exercise_id = $1, sets = $2, reps = $3, weight = $4
        WHERE log_id = $5 AND user_id = $6
        RETURNING *;
    `;

    try {
        const resDB = await database.query(editWorkoutSQL, [exercise_id, sets, reps, weight, log_id, user_id]);
        const updatedWorkout = resDB.rows[0];
        res.status(200).json({ updatedWorkout });
    } catch (error) {
        console.error('Error editing workout:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}

async function deleteWorkout(req, res) {
    const { log_id } = req.params;
    const user_id = req.user_id;

    const deleteWorkoutSQL = `
        DELETE FROM workout_logs
        WHERE log_id = $1 AND user_id = $2
        RETURNING *;
    `;

    try {
        const resDB = await database.query(deleteWorkoutSQL, [log_id, user_id]);
        const deletedWorkout = resDB.rows[0];
        res.status(200).json({ deletedWorkout });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}
const workoutController = { addWorkout, getWorkouts, editWorkout, deleteWorkout };

export default workoutController;
