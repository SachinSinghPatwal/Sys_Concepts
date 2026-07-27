const { Pool } = require("pg");

const primaryPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "sachin",
  database: "postgres",
});

const replicaPool = new Pool({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "sachin",
  database: "postgres",
});

module.exports = {
  primaryPool,
  replicaPool,
};
