import express from "express";
import issueController from "./src/controllers/issueController";
import verifyController from "./src/controllers/verifyController";
import authorizeAction from "./src/helpers/authorizeAction";
import resouceController from "./src/controllers/resrouceController";
import assignDeleteController from "./src/controllers/assign/del";
import assignCreateController from "./src/controllers/assign/create";
import assignListController from "./src/controllers/assign/list";

const app = express();
const port = 3000;

app.use(express.json());

// 認証認可
app.use("/issue", issueController);
app.use("/verify", verifyController);

// リソース(users, apps, roles)
app.all("/:table(users|apps|roles)/:action(list|create|read|update|delete)/:id?", authorizeAction, (req, res) => {
  const table = req.params.table as "users" | "apps" | "roles";
  resouceController(req, res, table);
});

// 権限系(roleUsers)
app.get("/:action(assign)", authorizeAction, assignListController);
app.post("/:action(assign)/:userId/:roleId", authorizeAction, assignCreateController);
app.delete("/:action(assign)/:userId/:roleId", authorizeAction, assignDeleteController);


app.listen(port, () =>{
  console.log(`Server is running on http://localhost:${port}`);
})

export default app;