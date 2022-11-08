import app from "./app";
import config from "./config";

const PORT = config.port || 3000;

console.log(`DEBUG : '${process.env.DEBUG}'`);
if (process.env && process.env.DEBUG && process.env.DEBUG === "1")
  console.log(config);

app.listen(PORT, () => console.info("api listening on port " + PORT));
