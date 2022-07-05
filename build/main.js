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
