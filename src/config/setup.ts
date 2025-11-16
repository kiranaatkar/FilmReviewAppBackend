import pool from "./db";

const setupDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS film (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        poster_url VARCHAR(255),
        runtime INT NOT NULL
      );
    `);

    console.log("✅ Database is set up and ready.");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
    throw err; // optional but recommended
  }
};

export default setupDB;
