// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:lastt1me@localhost:5432/Build Creating Data API Assignment",
});

export default connectionPool;
