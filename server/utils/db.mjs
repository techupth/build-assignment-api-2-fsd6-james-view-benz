// Create PostgreSQL Connection Pool here !
import "dotenv/config";
import * as pg from "pg";

const { Pool } = pg.default;

const connectionPool = new Pool({
  user: `${process.env.DB_USERNAME}`,
  host: "localhost",
  database: "school",
  password: `${process.env.DB_PASSWORD}`,
  port: 5432,
});

export default connectionPool;
