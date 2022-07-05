"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpApp = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
//models
require("../../models/configProjectModel");
class HttpApp {
    constructor(getProjectConfig) {
        this.httpApp = (0, express_1.default)();
        this.httpServer = http_1.default.createServer(this.httpApp);
        this.projectConfig = getProjectConfig;
        this.httpApp.get("*", (req, res) => {
            res.redirect(this.projectConfig.url);
        });
        this.httpApp.post("*", (req, res) => {
            res.redirect(this.projectConfig.url);
        });
    }
    startHttpServer() {
        this.httpServer.listen(this.projectConfig.httpPort);
        console.log("start http server");
    }
}
exports.HttpApp = HttpApp;
