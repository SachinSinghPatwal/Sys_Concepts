import Express from "express";
import { createUser, getUsers } from "./db.js";

const app = Express();

app.use(Express.json());

app.post("/users", async (req, res) => {
  const user = await createUser(req.body.name);
  res.json(user);
});

app.get("/users", async (req, res) => {
  const users = await getUsers();
  res.json(users);
});

app.listen(3000,()=>{
    console.log("listening on port http://localhost:3000");

})