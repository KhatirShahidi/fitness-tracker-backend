import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS with default settings
app.use(cors());

// Basic GET route
app.get("/", (req, res) => {
  const data = {
    message: "Hello World!",
    status: 200,
  };
  res.status(200).json(data);
});

// Basic POST route
app.post("/", (req, res) => {
  const body = req.body;
  const data = {
    message: "Hello World!",
    data: body,
  };
  res.status(200).json(data);
});

// Use imported routes for API endpoints
app.use("/", routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
