import Pool from "pg-pool";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import workoutModel from "../models/workoutModel.js";
import exerciseModel from "../models/exerciseModel.js";


dotenv.config();

const database = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function initializeDatabase() {
  try {
    await database.connect();
    const queryTime = await database.query("SELECT NOW()");
    const dbName = await database.query("SELECT current_database()");
    const currentTime = queryTime.rows[0].now;
    const currentDb = dbName.rows[0].current_database;
    console.log(`Connected to ${currentDb} at ${currentTime}`);

    await userModel.createUserTable();
    await exerciseModel.createExerciseTable();
    await workoutModel.createWorkoutTable();
    
  } catch (error) {
    console.error("Error connecting to database", error);
    process.exit(1);
  }
}

initializeDatabase();

export default database;
