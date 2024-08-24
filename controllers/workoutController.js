import workoutModel from '../models/workoutModel.js';


async function addWorkout(req, res) {
    const { exerciseId, sets, reps, weight, workoutDate } = req.body;
    const workout = await workoutModel.logWorkout(req.user.id, exerciseId, sets, reps, weight, workoutDate);
    res.json(workout);
}

async function getWorkouts(req, res) {
    const workouts = await workoutModel.getUserWorkouts(req.user.id);
    res.json(workouts);
}

const workoutController = { addWorkout, getWorkouts };

export default workoutController;
