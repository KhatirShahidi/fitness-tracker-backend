import express from 'express';
import authController from '../controllers/authController.js';
import workoutController from '../controllers/workoutController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/workouts', auth, workoutController.addWorkout);
router.get('/workouts', auth, workoutController.getWorkouts);

export default router;
