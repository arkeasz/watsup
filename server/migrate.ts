import { Client } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

async function getAppliedMigrations() {
  const res = await db.query(`SELECT name FROM migrations`);
  return res.rows.map(row => row.name);
}

async function runMigrations(direction: "up" | "down") {
  try {
    await db.connect();
    console.log(`✅ Connected to PostgreSQL`);

    await ensureMigrationsTable();
    const appliedMigrations = await getAppliedMigrations();

    const migrationsDir = path.join(__dirname, "migrations");
    let migrations = fs.readdirSync(migrationsDir).sort();

    if (direction === "down") {
      migrations = migrations.reverse();
    }

    for (const migration of migrations) {
      if (migration === "000_create_migrations_table" && direction === "down") {
        continue;
      }

      const filePath = path.join(migrationsDir, migration, `${direction}.sql`);
      if (!fs.existsSync(filePath)) continue;

      if (direction === "up" && appliedMigrations.includes(migration)) {
        continue;
      }

      const query = fs.readFileSync(filePath, "utf8");
      console.log(`🚀 Running migration: ${migration} (${direction})`);
      await db.query(query);

      if (direction === "up") {
        await db.query(`INSERT INTO migrations (name) VALUES ($1)`, [migration]);
      } else {
        await db.query(`DELETE FROM migrations WHERE name = $1`, [migration]);
      }
    }

    console.log(`✅ All migrations (${direction}) applied successfully.`);
  } catch (error) {
    console.error(`❌ Migration error (${direction}):`, error);
  } finally {
    await db.end();
  }
}

const direction = process.argv[2] === "down" ? "down" : "up";
runMigrations(direction);
