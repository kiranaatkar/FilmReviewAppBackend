import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: "postgresql://film_admin:AWfiSLwYTq0ZAFRDyl4OAR2w4iqRKuIx@dpg-d0c91ijuibrs73dul2s0-a.oregon-postgres.render.com/film_peak_reviews_72ee",//process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is needed for most Render setups
  },
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

export default pool;
