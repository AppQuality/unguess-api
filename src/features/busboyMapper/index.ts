import fs from "fs";
import os from "os";
import path from "path";

export type InvalidMedia = {
  name: string;
  errorCode: "FILE_TOO_BIG" | "INVALID_FILE_EXTENSION" | "GENERIC_ERROR";
};
export default async (
  req: OpenapiRequest,
  filter?: (file: { name: string }) => false | InvalidMedia["errorCode"]
): Promise<{ valid: Media[]; invalid: InvalidMedia[] }> => {
  return new Promise((resolve, reject) => {
    const form = req.busboy;
    const valid: Media[] = [];
    const invalid: InvalidMedia[] = [];
    form.on("file", (field: any, readableStream: any, fileData: any) => {
      let size = 0;
      let isInvalid = false;
      if (filter) {
        const hasError = filter({ name: fileData.filename });
        if (hasError) {
          isInvalid = true;
          readableStream.resume();
          invalid.push({ name: fileData.filename, errorCode: hasError });
          return;
        }
      }

      const filePath = path.join(
        os.tmpdir(),
        `${new Date().getTime()}-${fileData.filename}`
      );
      const fstream = fs.createWriteStream(filePath);

      readableStream.on("data", (data: Buffer) => {
        size += data.byteLength;
        if (
          size > parseInt(process.env.MAX_FILE_SIZE || "536870912") &&
          !isInvalid
        ) {
          isInvalid = true;
          readableStream.resume();
          invalid.push({ name: fileData.filename, errorCode: "FILE_TOO_BIG" });
          return;
        }
        fstream.write(data);
      });

      readableStream.on("close", () => {
        while (!fs.existsSync(filePath)) {}
        const readStream = fs.createReadStream(filePath);
        if (!isInvalid) {
          valid.push({
            stream: readStream,
            mimeType: fileData.mimeType,
            name: fileData.filename,
            size: size,
            tmpPath: filePath,
          });
        }
      });
    });
    form.on("error", (err: any) => {
      reject(err);
    });
    form.on("finish", () => {
      resolve({ valid, invalid });
    });
    req.pipe(form); // pipe the request to the form handler
  });
};
