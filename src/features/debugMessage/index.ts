export default (message: any) => {
  if (process.env && process.env.DEBUG) {
    console.log(message);
  }
};
