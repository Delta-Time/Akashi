import express from "express";
import issueController from "./src/controllers/issueController";
import verifyController from "./src/controllers/verifyController";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/issue", issueController);
app.use("/verify", verifyController);

app.listen(port, () =>{
  console.log(`Server is running on http://localhost:${port}`);
})