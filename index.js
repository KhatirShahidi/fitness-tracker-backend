import express from "express";
import cors from "cors";
import dotnet from "dotenv";
import routes from "./routes/routes.js";

dotnet.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  const data = {
    message: "Hello World!",
    status: 200,
  };
  res.status(200).json(data);
});

app.post("/", (req, res) => {
  const body = req.body;
  const data = {
    message: "Hello World!",
    data: body,
  };
  res.status(200).json(data);
});

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
