type ConfigProjectModel = {
  url: string;
  sslPort: number;
  httpPort: number;
  sslCertPath: {
    cert: string,
    chain: string,
    privateKey: string
  }
  userControl: {
    reservedTimeRangeIninutes: number,
    reservedPerday: number
  }
}

