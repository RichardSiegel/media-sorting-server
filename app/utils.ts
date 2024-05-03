export const isRunOnServer = typeof window === "undefined";

export const extractPathAndName = (mediaPath: string) => {
  const [fileName, ...reverseDirParts] = mediaPath.split("/").reverse();
  const dirPath = (reverseDirParts || []).reverse().join("/");
  return { dirPath, fileName };
};
