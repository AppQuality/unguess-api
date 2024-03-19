import fileExist from "@src/features/s3/fileExists";

export const checkUrl = async (url: string) => {
  return await fileExist({ url });
};
