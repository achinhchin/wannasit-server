type CountdownStateModel = Map<string, {
    alert: NodeJS.Timeout,
    end: NodeJS.Timeout
}>;
