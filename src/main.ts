import fs from 'fs';
//apps
import { HttpApp } from "./apps/httpApp/httpApp";
import { MainApp } from './apps/mainApp/mainApp';
//models
import "./models/configProjectModel";

function main() {
    try {
        var projectConfig = JSON.parse(fs.readFileSync("./config.json").toString());
    }
    catch (error) {
        console.error("error in ./config.json file");
    }

    var mainApp = new MainApp(projectConfig);
    mainApp.startMainServer();
}

main();
