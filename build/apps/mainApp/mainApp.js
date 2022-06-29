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
require("../../models/tablesStateModel");
require("../../models/tablePosition");
require("../../models/userLastReservedModel");
require("../../models/userReservedNumberModel");
class MainApp {
    constructor(getProjectConfig) {
        this.tablesState = [
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]]
        ];
        this.userLastReserved = new Map();
        this.userReservedNumber = new Map();
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
                    if (yield firebase_admin_1.default.auth().getUser(req.body.uid)) {
                        if (req.body.for == "get") {
                            res.send(this.tablesState);
                        }
                        else if (req.body.for == "set") {
                            var lastReserved = this.userLastReserved.get(req.body.uid), reservedNumber = this.userReservedNumber.get(req.body.uid);
                            if (lastReserved != undefined && (new Date()).getTime() - (lastReserved === null || lastReserved === void 0 ? void 0 : lastReserved.getTime()) < this.projectConfig.userControl.reservedTimeRangeIninutes * 60 * 1000) {
                                res.send("reservedTimeRange");
                            }
                            else if (reservedNumber != undefined && reservedNumber > 2) {
                                res.send("reservedNumber");
                            }
                            else {
                                res.end();
                            }
                        }
                    }
                    else {
                        res.send("wrongUid");
                    }
                }
            }
            catch (error) {
                res.sendStatus(400);
                console.error("bad request");
            }
        }));
    }
    startMainServer() {
        this.mainServer.listen(this.projectConfig.sslPort);
        console.log("start mainServer");
    }
}
exports.MainApp = MainApp;
