import express from "express";
import cors from "cors";
import filmRoutes from "./routes/filmRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/films", filmRoutes);

export default app;
