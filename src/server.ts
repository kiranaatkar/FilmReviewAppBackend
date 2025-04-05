import express from "express";
import dotenv from "dotenv";
import setupDB from "./config/setup";
import filmRoutes from "./routes/filmRoutes";
import userRoutes from "./routes/userRoutes";
import swaggerSpec from "./config/swaggerConfig";
import swaggerUi from "swagger-ui-express";

setupDB(); // Ensure database is ready before starting the server

dotenv.config();

const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/films", filmRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

//  npx ts-node src/server.ts 