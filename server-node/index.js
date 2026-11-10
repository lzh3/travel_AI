import express from "express";
import HttpStatus from "http-status-codes";
import dotenv from "dotenv";

import travelRouter from "./routes/travel.js";

const app = express();

dotenv.config();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({
    code: HttpStatus.OK,
    msg: "Hello World!",
  });
});

app.use("/api/travel", travelRouter);

app.listen(port, () => {
  console.log(`服务运行在： http://localhost:${port}`);
});
