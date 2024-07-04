require("dotenv").config();
import express from "express";
import { SequelizeDB } from "./singleton/sequelize";
import * as Middleware from "./middlewares/middleware";

import router from "./routes/router";
/*import { sendResponse } from "./utils/messages_sender";
import HttpStatusCode from "./utils/http_status_code";
import Message from "./utils/messages_string";
*/

const sequelize = SequelizeDB.getConnection();

const app = express();
const port = process.env.API_PORT;

app.use(express.json()); 
app.use(router);
/*app.use("*", (req, res) => {
  sendResponse(res, HttpStatusC ode.NOT_FOUND, Message.ROUTE_NOT_FOUND);
});*/
app.use(Middleware.AUTH)

app.listen(port, () => { 
  console.log(`App in ascolto sulla porta ${port}...`);
  sequelize
    .sync()
    .then(() => {
      console.log("Tabelle sincronizzate.");
    })
});