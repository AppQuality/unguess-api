import fs from "fs";
import OpenAPIBackend from "openapi-backend";
import Comments from "parse-comments";
import path from "path";

const getAllRoutesByComment = function (
  dirPath: string,
  arrayOfFiles: { name: string; path: string }[] = []
) {
  const comments = new Comments();
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles;

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllRoutesByComment(dirPath + "/" + file, arrayOfFiles);
    } else {
      const filepath = path.join(dirPath, "/", file);
      const content = fs.readFileSync(filepath, "utf8");
      const commentsContent = comments.parse(content);
      const routeComment = commentsContent.find((comment) =>
        comment.value.includes("OPENAPI-ROUTE")
      );
      if (routeComment) {
        const routeName = routeComment.value.split(":")[1].trim();
        arrayOfFiles.push({
          name: routeName,
          path: `${dirPath}/${file}`,
        });
      }
    }
  });

  return arrayOfFiles;
};

export default (api: OpenAPIBackend) => {
  try {
    const files = getAllRoutesByComment("./src/routes");
    files.forEach((file) => {
      const filePath = file.path
        .replace("./src/routes", ".")
        .replace("index.ts", "");

      api.register(file.name, (c, req, res) => {
        let route = require(filePath).default;
        return route(c, req, res);
      });
    });
  } catch (e) {
    console.log(e);
  }
};
