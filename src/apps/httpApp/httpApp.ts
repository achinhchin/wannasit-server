import http from 'http';
import express from 'express';

//models
import "../../models/configProjectModel";

export class HttpApp {
  projectConfig: ConfigProjectModel;

  httpApp: express.Express = express();
  httpServer: http.Server = http.createServer(this.httpApp);

  constructor(getProjectConfig: ConfigProjectModel) {
    this.projectConfig = getProjectConfig;

    this.httpApp.get("*", (req, res) => {
      res.redirect(this.projectConfig.url);
    });

    this.httpApp.post("*", (req, res) => {
      res.redirect(this.projectConfig.url);
    });
  }

  startHttpServer(): void {
    this.httpServer.listen(this.projectConfig.httpPort);
    console.log("start http server");
  }
}

