import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const primaryPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "postgres",
});

export const replicaPool = new Pool({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "postgres",
});

const primaryResult = await primaryPool.query(
  "SELECT inet_server_port(), pg_is_in_recovery()",
);
const replicaResult = await replicaPool.query(
  "SELECT inet_server_port(), pg_is_in_recovery()",
);

export const db = {
  read(query, params) {
    return replicaPool.query(query, params);
  },

  write(query, params) {
    return primaryPool.query(query, params);
  },
};

console.log(replicaResult.rows);

console.log(primaryResult.rows);

const primary = await db.write(
  "SELECT inet_server_port(), pg_is_in_recovery()",
);

const replica = await db.read("SELECT inet_server_port(), pg_is_in_recovery()");

console.log("WRITE:", primary.rows);
console.log("READ :", replica.rows);

// fn
export async function createUser(name) {
  const result = await db.write(
    `INSERT INTO users(name)
     VALUES($1)
     RETURNING id, name, inet_server_port() AS port`,
    [name],
  );

  return result.rows[0];
}

export async function getUsers() {
  const result = await db.read(
    `SELECT id, name, inet_server_port() AS port
     FROM users
     ORDER BY id`,
  );

  return result.rows;
}