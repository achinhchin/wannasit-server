type ProjectConfigModel = {
  url: string;
  sslPort: number;
  httpPort: number;
  sslCertPath: {
    cert: string,
    chain: string,
    privateKey: string
  }
  userControl: {
<<<<<<< HEAD
    reserveTimeRangeInMinutes: number,
    reserveTimeAlertInMinutes: number,
    reserveTimesPerDay: number
=======
    reservedTimeRangeInMinutes: number,
    reservedNumberPerday: number
>>>>>>> origin/0.0.a.0
  }
}
