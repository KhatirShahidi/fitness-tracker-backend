import exerciseModel from '../models/exerciseModel.js';
import database from '../database/connection.js';
import isAdmin from '../middleware/isAdmin.js';

// Function to create a new exercise
async function createExercise(req, res) {
    const { exercise_name, exercise_type } = req.body;

    // Validate request data
    if (!exercise_name || !exercise_type) {
        return res.status(400).json({ message: 'Please provide exercise name and type' });
    }

    const createExerciseSQL = `
        INSERT INTO exercises (exercise_name, exercise_type) 
        VALUES ($1, $2) RETURNING *;
    `;

    try {
        const resDB = await database.query(createExerciseSQL, [exercise_name, exercise_type]);
        const newExercise = resDB.rows[0];
        res.status(201).json({ newExercise });
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}

// Function to update an exercise
async function updateExercise(req, res) {
    const { exercise_id } = req.params;
    const { exercise_name, exercise_type } = req.body;

    // Validate request data
    if (!exercise_name || !exercise_type) {
        return res.status(400).json({ message: 'Please provide exercise name and type' });
    }

    const updateExerciseSQL = `
        UPDATE exercises 
        SET exercise_name = $1, exercise_type = $2
        WHERE exercise_id = $3 RETURNING *;
    `;

    const isAdmin = await isAdmin(req, res);

    if (!isAdmin) {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    try {
        const resDB = await database.query(updateExerciseSQL, [exercise_name, exercise_type, exercise_id]);
        const updatedExercise = resDB.rows[0];

        if (!updatedExercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json({ updatedExercise });
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}

// Function to delete an exercise
async function deleteExercise(req, res) {
    const { exercise_id } = req.params;

    const deleteExerciseSQL = `
        DELETE FROM exercises 
        WHERE exercise_id = $1 RETURNING *;
    `;

    const isAdmin = await isAdmin(req, res);

    if (!isAdmin) {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    try {
        const resDB = await database.query(deleteExerciseSQL, [exercise_id]);
        const deletedExercise = resDB.rows[0];

        if (!deletedExercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json({ message: 'Exercise deleted successfully', deletedExercise });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}

async function viewExercise (req, res) {
    const { exercise_id } = req.params;
    const viewExerciseSQL = `
        SELECT * FROM exercises WHERE exercise_id = $1;
    `;

    try {
        const resDB = await database.query(viewExerciseSQL, [exercise_id]);
        const exercise = resDB.rows[0];
        res.status(200).json({ exercise });
    } catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
}




const exerciseController = { createExercise, updateExercise, deleteExercise, viewExercise };

export default exerciseController;
