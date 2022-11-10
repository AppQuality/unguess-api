export default (message: any) => {
  if (process.env && process.env.DEBUG && process.env.DEBUG === "1") {
    console.log(message);
  }
};
