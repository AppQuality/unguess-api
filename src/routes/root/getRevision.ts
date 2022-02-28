import fs from "fs";

export default () => {
  const rev = fs.readFileSync(".git/HEAD").toString().trim();
  if (rev.indexOf(":") === -1) {
    return rev;
  } else {
    return fs
      .readFileSync(".git/" + rev.substring(5))
      .toString()
      .trim()
      .substr(0, 6);
  }
};
