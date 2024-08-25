import express from 'express';
import authController from '../controllers/authController.js';
import workoutController from '../controllers/workoutController.js';
import auth from '../middleware/authMiddleware.js';
import exerciseController from '../controllers/exerciseController.js';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

router.post('/workouts', auth, workoutController.addWorkout);
router.get('/workouts', auth, workoutController.getWorkouts);
router.put('/workouts/:log_id', auth, workoutController.editWorkout);
router.delete('/workouts/:log_id', auth, workoutController.deleteWorkout);

router.post('/exercise', auth, exerciseController.createExercise);
router.get('/exercise/:exercise_id', auth, exerciseController.viewExercise);
router.delete('/exercise/:exercise_id', auth, exerciseController.deleteExercise);
router.put('/exercise/:exercise_id', auth, exerciseController.updateExercise);

export default router;
