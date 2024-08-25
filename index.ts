import express from "express";
import issueController from "./src/controllers/issueController";
import verifyController from "./src/controllers/verifyController";
import authorizeAction from "./src/helpers/authorizeAction";
import resouceController from "./src/controllers/resrouceController";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/issue", issueController);
app.use("/verify", verifyController);

app.all("/:table(users|apps|roles)/:action(list|create|read|update|delete)/:id?", authorizeAction, (req, res) => {
  const table = req.params.table as "users" | "apps" | "roles";
  resouceController(req, res, table);
});

app.listen(port, () =>{
  console.log(`Server is running on http://localhost:${port}`);
})