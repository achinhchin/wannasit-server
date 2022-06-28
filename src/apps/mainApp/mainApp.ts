import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import firebaseAdmin from 'firebase-admin';

//models
import "../../models/configProjectModel";
import "../../models/tablesStateModel";
import "../../models/tablePosition";
import "../../models/userLastReservedModel";
import "../../models/userReservedNumberModel";

export class MainApp {
  projectConfig: ConfigProjectModel;

  tablesState: TablesStateModel = [
    [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
    [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
    [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]]
  ];
  userLastReserved: UserLastReservedModel = new Map();
  userReservedNumber: UserReservedNumberModel = new Map();

  mainApp: express.Express = express()
  mainServer: http.Server = http.createServer(this.mainApp);

  constructor(getProjectConfig: ConfigProjectModel) {
    this.projectConfig = getProjectConfig;

    this.mainApp.use(bodyParser.json());

    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(require("../../../secrets/serviceAccountKey.json")),
    });

    this.mainApp.post("/wannasit", async (req, res) => {
      try {
        if (req.body.from == "client") {
          if (await firebaseAdmin.auth().getUser(req.body.uid)) {
            if (req.body.for == "get") {
              res.send(this.tablesState);
            } else if (req.body.for == "set") {
              var lastReserved: Date | undefined = this.userLastReserved.get(req.body.uid), reservedNumber: number | undefined = this.userReservedNumber.get(req.body.uid);
              if (lastReserved != undefined && (new Date()).getTime() - lastReserved?.getTime() < this.projectConfig.userControl.reservedTimeRangeIninutes * 60 * 1000) {
                res.send("reservedTimeRange");
              } else if (reservedNumber != undefined && reservedNumber > 2) {
                res.send("reservedNumber")
              } else {
                res.end();
              }
            }
          } else {
            res.send("wrongUid")
          }
        }
      } catch (error) {
        res.sendStatus(400);
        console.error("bad request");
      }
    });
  }

  startMainServer(): void {
    this.mainServer.listen(this.projectConfig.sslPort);
    console.log("start mainServer");
  }
}

