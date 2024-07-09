require("dotenv").config();
import express from "express";
import { SequelizeDB } from "./singleton/sequelize";
import * as Middleware from "./middlewares/middleware";
import router from "./routes/router";
import ErrorSender from "./utils/error_sender";
import HttpStatusCode from "./utils/status_code";
import Messages from "./utils/messages";

const sequelize = SequelizeDB.getConnection();
const sendError = new ErrorSender();

const app = express();
const port = process.env.API_PORT;

app.use(express.json()); 
app.use(Middleware.AUTH)
app.use(router);
app.use("*", (req, res) => {
  sendError.send(res, HttpStatusCode.BAD_REQUEST, Messages.ROUTE_NOT_FOUND);
});

app.listen(port, () => { 
  console.log(`App in ascolto sulla porta ${port}...`);
  sequelize
    .sync()
    .then(() => {
      console.log("Tabelle sincronizzate.");
    })
});