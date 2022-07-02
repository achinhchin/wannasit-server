<<<<<<< HEAD
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const mainApp_1 = require("./apps/mainApp/mainApp");
//models
require("./models/configProjectModel");
function main() {
    try {
        var projectConfig = JSON.parse(fs_1.default.readFileSync("./config.json").toString());
    }
    catch (error) {
        console.error("error in ./config.json file");
    }
    var mainApp = new mainApp_1.MainApp(projectConfig);
    mainApp.startMainServer();
}
main();
=======
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
//apps
const httpApp_1 = require("./apps/httpApp/httpApp");
const mainApp_1 = require("./apps/mainApp/mainApp");
//models
require("./models/configProjectModel");
function main() {
    try {
        var projectConfig = JSON.parse(fs_1.default.readFileSync("../config.json").toString());
    }
    catch (error) {
        console.error("error in ./config.json file");
    }
    var httpApp = new httpApp_1.HttpApp(projectConfig);
    httpApp.startHttpServer();
    var mainApp = new mainApp_1.MainApp(projectConfig);
    mainApp.startMainServer();
}
main();
>>>>>>> origin/0.0.a.0
