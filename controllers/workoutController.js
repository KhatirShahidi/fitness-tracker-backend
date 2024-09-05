import workoutModel from '../models/workoutModel.js';
import userModel from '../models/userModel.js';
import database from '../database/connection.js';

// Function to add a new workout log
async function addWorkout(req, res) {
    // Extract workout data and user identifier from the request body
    const { exercise_name, sets, reps, weight } = req.body;
    const user_id = req.user_id;  // Extracted from the JWT token by middleware

    // Check if all required fields are provided
    if (!user_id || !exercise_name || sets === undefined || reps === undefined || weight === undefined) {
        return res.status(400).json({ message: 'Please provide complete workout data' });
    }

    try {
        // Check if the user_id exists in the users table
        const checkUserSQL = `SELECT * FROM users WHERE user_id = $1`;
        const userResult = await database.query(checkUserSQL, [user_id]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid user_id.' });
        }

        // Check if the exercise_name exists in the exercises table
        const checkExerciseSQL = `SELECT exercise_id FROM exercises WHERE exercise_name = $1`;
        let exerciseResult = await database.query(checkExerciseSQL, [exercise_name]);
        let exercise_id;

        // If exercise does not exist, create a new exercise
        if (exerciseResult.rows.length === 0) {
            const createExerciseSQL = `INSERT INTO exercises (exercise_name) VALUES ($1) RETURNING exercise_id`;
            const newExercise = await database.query(createExerciseSQL, [exercise_name]);
            exercise_id = newExercise.rows[0].exercise_id;
        } else {
            exercise_id = exerciseResult.rows[0].exercise_id;
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
  const { sets, reps, weight } = req.body; // Only update sets, reps, and weight
  const user_id = req.user_id;

  try {
    // Check if the workout log exists and belongs to the user
    const checkWorkoutSQL = `SELECT * FROM workout_logs WHERE log_id = $1 AND user_id = $2`;
    const checkResult = await database.query(checkWorkoutSQL, [
      log_id,
      user_id,
    ]);

    // If no workout log is found, return a 404 error
    if (checkResult.rows.length === 0) {
      console.error('Workout not found or unauthorized access:', {
        log_id,
        user_id,
      });
      return res
        .status(404)
        .json({ message: 'Workout not found or not authorized.' });
    }

    // Extract the existing exercise_id from the current workout log
    const existingWorkout = checkResult.rows[0];
    const exercise_id = existingWorkout.exercise_id;

    // Log the current workout data before updating
    console.log('Current Workout Data:', existingWorkout);

    // Update the workout log with the new sets, reps, and weight
    const editWorkoutSQL = `
      UPDATE workout_logs
      SET sets = $1, reps = $2, weight = $3
      WHERE log_id = $4 AND user_id = $5
      RETURNING *;
    `;

    // Execute the update query with the provided data
    const resDB = await database.query(editWorkoutSQL, [
      sets,
      reps,
      weight,
      log_id,
      user_id,
    ]);
    const updatedWorkout = resDB.rows[0];

    // Check if the update was successful
    if (!updatedWorkout) {
      console.error('Failed to update workout log:', { log_id, user_id });
      return res.status(400).json({ message: 'Failed to update workout.' });
    }

    // Log the updated workout data
    console.log('Updated Workout Data:', updatedWorkout);

    // Return the updated workout data in the response
    res.status(200).json({ updatedWorkout });
  } catch (error) {
    // Log the full error stack for detailed analysis
    console.error('Error editing workout:', error.stack);
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
