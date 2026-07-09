import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const dbUrl = new URL(
	process.env.DATABASE_URL ||
		"postgresql://crm_user:crm_password@127.0.0.1:5432/crm_db",
);

const pool = new Pool({
	user: dbUrl.username,
	password: dbUrl.password,
	host: dbUrl.hostname,
	port: parseInt(dbUrl.port) || 5432,
	database: dbUrl.pathname.slice(1) || "crm_db",
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
	console.error("Unexpected error on idle client", err);
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export default pool;
