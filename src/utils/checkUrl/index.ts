import axios from "axios";
import fileExists from "@src/features/s3/fileExists";

export const checkUrl = async (url: string) => {
  return await fileExists({ url });
};
