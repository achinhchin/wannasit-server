import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import firebaseAdmin from 'firebase-admin';

//models
import "../../models/configProjectModel";
import "../../models/chairStateModel";
import "../../models/chairPositionModel";
import "../../models/userLastTimeReserveModel";
import "../../models/userReserveTimesInDay";
import "../../models/countdownStateModel";
import { ReservationStateModel } from "../../models/reservationStateModel";
import { SittingState } from '../../models/sittingState';
import { isSetIterator } from 'util/types';

export class MainApp {
  projectConfig: ProjectConfigModel;

  chairsState: ChairStateModel = [
    [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
    [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
    [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]]
  ];
  reservationState: ReservationStateModel = new Map();
  sittingState: SittingState = new Map();
  coutdownState: CountdownStateModel = new Map();

  userLastTimeReserve: userLastTimeReserveModel = new Map();
  userReserveTimesInDay: UserReserveTimesInDay = new Map();

  mainApp: express.Express = express()
  mainServer: http.Server;

  constructor(getProjectConfig: ProjectConfigModel) {
    this.projectConfig = getProjectConfig;
    this.mainServer = http.createServer(
      this.mainApp);

    this.mainApp.use(bodyParser.json());

    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(require("../../../secrets/serviceAccountKey.json")),
    });

    this.mainApp.post("/wannasit", async (req, res) => {
      try {
        if (req.body.from == "client") {
          var checkUser: boolean = true;
          try {
            await firebaseAdmin.auth().getUser(req.body.uid);
          } catch (e) {
            // -1 - Wrong uid.
            res.send("-1");
            checkUser = false;
          }
          if (checkUser) {
            if (req.body.for == "get") {
              var chairsState: ChairStateModel = JSON.parse(JSON.stringify(this.chairsState));
              var thisChairPositionReservation: ChairPositionModel | undefined = this.reservationState.get(req.body.uid);
              if (thisChairPositionReservation != undefined) {
                chairsState[thisChairPositionReservation.column][thisChairPositionReservation.row][thisChairPositionReservation.side ? 1 : 0][thisChairPositionReservation.column] = 3;
              }
              console.log(this.chairsState[0][0][0][0]);

              res.send({ chairsState: chairsState, lastTimeReserve: lastTimeReserve });
            } else if (req.body.for == "reserve") {
              /*
              response code
                0 - You are sitting.
                1 - You are reserving.
                2 - Chair is being reserving.
                3 - Chair is being sitting.
                4 - You are in reserve cool down.
                5 - You are in limit times to reserve in today.
              */
              var lastTimeReserve: number | undefined = this.userLastTimeReserve.get(req.body.uid),
                reserveTimesInDay: number | undefined = this.userReserveTimesInDay.get(req.body.uid);
              var chairPosition = req.body.chairPosition as ChairPositionModel;
              if (this.sittingState.get(req.body.uid) != undefined) {
                res.send("0");
              } else if (this.reservationState.get(req.body.uid) != undefined) {
                res.send("1");
              } else if (this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] == 1) {
                res.send("2");
              } else if (this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] == 2) {
                res.send("3");
              } else if (lastTimeReserve != undefined && (new Date()).getTime() - lastTimeReserve < this.projectConfig.userControl.reserveTimeRangeInMinutes * 60 * 1000) {
                res.send("4");
              } else if (reserveTimesInDay != undefined && reserveTimesInDay > this.projectConfig.userControl.reserveTimesPerDay - 1) {
                res.send("5");
              } else {
                this.chairsState[chairPosition.row][chairPosition.position][chairPosition.side ? 1 : 0][chairPosition.position] = 1;
                this.reservationState.set(req.body.uid, chairPosition);

                this.userReserveTimesInDay.set(req.body.uid, reserveTimesInDay != undefined ? reserveTimesInDay + 1 : 1);
                this.userLastTimeReserve.set(req.body.uid, (new Date()).getTime());

                this.coutdownState.set(req.body.uid, {
                  alert: setTimeout(() => { }, this.projectConfig.userControl.reserveTimeAlertInMinutes * 60 * 1000),
                  end: setTimeout(() => {
                    this.coutdownState.delete(req.body.uid);
                    this.reservationState.delete(req.body.uid);
                    this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] = 0;
                  },
                    this.projectConfig.userControl.reserveTimeRangeInMinutes * 60 * 1000
                  )
                }
                );

                res.end();
              }
            } else if (req.body.for == "cancel") {
              /*
              0 - You are sitting.
              1 - You are not reserve.
              */
              if (this.sittingState.get(req.body.uid) != undefined) {
                res.send("0");
              } else if (this.reservationState.get(req.body.uid) == undefined) {
                res.send("1")
              } else {
                var chairPosition = req.body.chairPostion as ChairPositionModel;
                this.coutdownState.delete(req.body.uid);
                this.reservationState.delete(req.body.uid);
                this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] = 0;
                res.end();
              }
            } else {
              // -2 - invalid for
              res.send("-2")
            }
          }
        }
      } catch (error) {
        res.sendStatus(400);
        console.error(error);
      }
    });
  }

  startMainServer(): void {
    this.mainServer.listen(this.projectConfig.sslPort);
    console.log("start mainServer");
  }
}
