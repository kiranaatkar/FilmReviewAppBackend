import pool from "./db";

const setupDB = async () => {
  try {
    // Create "films" table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS films (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        poster_url TEXT
      );
    `);
    console.log("✅ Database is set up and ready.");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
  }
};

export default setupDB;
