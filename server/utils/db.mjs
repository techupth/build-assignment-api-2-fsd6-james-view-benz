// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg.default;
dotenv.config();

const connectionPool = new Pool({
  connectionString: `postgresql://${process.env.DATABASE_USERNAME_KEY}:${process.env.DATABASE_PASSWORD_KEY}@${process.env.DATABASE_HOST_KEY}:${process.env.DATABASE_PORT_KEY}/${process.env.DATABASE_NAME_KEY}`,
});

export default connectionPool;
