import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: "postgresql://film_admin:VlODn68LPdrR9a0j66zp2G5fe4BQ3Sqw@dpg-cvo4u9emcj7s73ftpa0g-a.oregon-postgres.render.com/film_peak_reviews",//process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is needed for most Render setups
  },
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err));

export default pool;
