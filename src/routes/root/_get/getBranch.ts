import fs from "fs";

export default () => {
  const gitHeadPath = `.git/HEAD`;
  return fs.existsSync(gitHeadPath)
    ? fs.readFileSync(gitHeadPath, "utf-8").trim().split("/")[2]
    : false;
};
