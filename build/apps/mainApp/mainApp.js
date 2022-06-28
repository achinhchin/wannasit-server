"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainApp = void 0;
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
//models
require("../../models/configProjectModel");
require("../../models/tablesStateModel");
class MainApp {
    constructor(getProjectConfig) {
        this.tableState = [
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]],
            [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]]
        ];
        this.mainApp = (0, express_1.default)();
        this.mainServer = https_1.default.createServer(this.mainApp);
        this.projectConfig = getProjectConfig;
        this.mainApp.post("/wannasit", (req, res) => {
            if (req.body.from == "client") {
                if (req.body.for == "get") {
                    res.send(this.tableState);
                }
            }
        });
    }
    startMainServer() {
        this.mainServer.listen(this.projectConfig.sslPort);
        console.log("start mainServer");
    }
}
exports.MainApp = MainApp;
