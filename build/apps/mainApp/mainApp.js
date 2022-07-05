"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainApp = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
//models
require("../../models/configProjectModel");
require("../../models/chairStateModel");
require("../../models/chairPositionModel");
require("../../models/userLastTimeReserveModel");
require("../../models/userReserveTimesInDay");
require("../../models/countdownStateModel");
class MainApp {
    constructor(getProjectConfig) {
        this.chairsState = [
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]]
        ];
        this.reservationState = new Map();
        this.sittingState = new Map();
        this.coutdownState = new Map();
        this.userLastTimeReserve = new Map();
        this.userReserveTimesInDay = new Map();
        this.mainApp = (0, express_1.default)();
        this.projectConfig = getProjectConfig;
        this.mainServer = http_1.default.createServer(this.mainApp);
        this.mainApp.use(body_parser_1.default.json());
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(require("../../../secrets/serviceAccountKey.json")),
        });
        this.mainApp.post("/wannasit", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.body.from == "client") {
                    var checkUser = true;
                    try {
                        yield firebase_admin_1.default.auth().getUser(req.body.uid);
                    }
                    catch (e) {
                        // -1 - Wrong uid.
                        res.send("-1");
                        checkUser = false;
                    }
                    if (checkUser) {
                        if (req.body.for == "get") {
                            var chairsState = JSON.parse(JSON.stringify(this.chairsState));
                            var thisChairPositionReservation = this.reservationState.get(req.body.uid);
                            if (thisChairPositionReservation != undefined) {
                                chairsState[thisChairPositionReservation.column][thisChairPositionReservation.row][thisChairPositionReservation.side ? 1 : 0][thisChairPositionReservation.column] = 3;
                            }
                            console.log(this.chairsState[0][0][0][0]);
                            res.send({ chairsState: chairsState, lastTimeReserve: lastTimeReserve });
                        }
                        else if (req.body.for == "reserve") {
                            /*
                            response code
                              0 - You are sitting.
                              1 - You are reserving.
                              2 - Chair is being reserving.
                              3 - Chair is being sitting.
                              4 - You are in reserve cool down.
                              5 - You are in limit times to reserve in today.
                            */
                            var lastTimeReserve = this.userLastTimeReserve.get(req.body.uid), reserveTimesInDay = this.userReserveTimesInDay.get(req.body.uid);
                            var chairPosition = req.body.chairPosition;
                            if (this.sittingState.get(req.body.uid) != undefined) {
                                res.send("0");
                            }
                            else if (this.reservationState.get(req.body.uid) != undefined) {
                                res.send("1");
                            }
                            else if (this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] == 1) {
                                res.send("2");
                            }
                            else if (this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] == 2) {
                                res.send("3");
                            }
                            else if (lastTimeReserve != undefined && (new Date()).getTime() - lastTimeReserve < this.projectConfig.userControl.reserveTimeRangeInMinutes * 60 * 1000) {
                                res.send("4");
                            }
                            else if (reserveTimesInDay != undefined && reserveTimesInDay > this.projectConfig.userControl.reserveTimesPerDay - 1) {
                                res.send("5");
                            }
                            else {
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
                                    }, this.projectConfig.userControl.reserveTimeRangeInMinutes * 60 * 1000)
                                });
                                res.end();
                            }
                        }
                        else if (req.body.for == "cancel") {
                            /*
                            0 - You are sitting.
                            1 - You are not reserve.
                            */
                            if (this.sittingState.get(req.body.uid) != undefined) {
                                res.send("0");
                            }
                            else if (this.reservationState.get(req.body.uid) == undefined) {
                                res.send("1");
                            }
                            else {
                                var chairPosition = req.body.chairPostion;
                                this.coutdownState.delete(req.body.uid);
                                this.reservationState.delete(req.body.uid);
                                this.chairsState[chairPosition.row][chairPosition.column][chairPosition.side ? 1 : 0][chairPosition.position] = 0;
                                res.end();
                            }
                        }
                        else {
                            // -2 - invalid for
                            res.send("-2");
                        }
                    }
                }
            }
            catch (error) {
                res.sendStatus(400);
                console.error(error);
            }
        }));
    }
    startMainServer() {
        this.mainServer.listen(this.projectConfig.sslPort);
        console.log("start mainServer");
    }
}
exports.MainApp = MainApp;
