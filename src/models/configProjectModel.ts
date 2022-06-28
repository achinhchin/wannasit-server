type ConfigProjectModel = {
  url: string;
  sslPort: number;
  httpPort: number;
  userControl: {
    reservedTimeRangeIninutes: number,
    reservedPerday: number
  }
}

