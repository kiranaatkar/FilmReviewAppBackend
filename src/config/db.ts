import { Pool } from "pg";
import dotenv from "dotenv";

const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();

const pool = new Pool({
  // "postgresql://film_admin:AWfiSLwYTq0ZAFRDyl4OAR2w4iqRKuIx@dpg-d0c91ijuibrs73dul2s0-a.oregon-postgres.render.com/film_peak_reviews_72ee",
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

export default pool;
