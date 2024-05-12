"use server";
import fs from "fs";
import path from "path";
import { loadMediaStateFromServer } from "./media-state";
import { extractPathAndName } from "../utils";

const isVisibleFile = (filePath: string) =>
  !filePath.split("/").reverse()[0].startsWith(".");

class FsInfo {
  private fileList: string[];

  private fileById = (id: number) =>
    id < this.fileList.length && id >= 0 ? this.fileList[id] : undefined;

  public constructor(fileList: string[]) {
    this.fileList = fileList.filter(isVisibleFile);
  }
  public exists = (currentPath: string) =>
    this.fileList.includes(decodeURI(currentPath));

  public pathBefore = (currentPath: string) =>
    this.exists(currentPath)
      ? this.fileById(this.fileList.indexOf(decodeURI(currentPath)) - 1)
      : undefined;

  public pathAfter = (currentPath: string) =>
    this.exists(currentPath)
      ? this.fileById(this.fileList.indexOf(decodeURI(currentPath)) + 1)
      : undefined;
}

//const saveCacheReturn = (dir: string, returnToCache: string[]) => {
//const stateFilePath = `${decodeURI(dir)}/.dirContent.cache`;
//fs.writeFile(stateFilePath, JSON.stringify(returnToCache), (err) => {
//err
//? console.error(`Error writing file ${stateFilePath}:`, err)
//: console.log(`State saved successfully for ${stateFilePath}`);
//});
//};

//const getCachedReturn = (dir: string) => {
//const stateFilePath = `${decodeURI(dir)}/.dirContent.cache`;
//if (!fs.existsSync(stateFilePath)) {
//return null;
//}
//const stringArray = JSON.parse(
//fs.readFileSync(stateFilePath).toString()
//) as string[];
//if (typeof stringArray !== "object" && typeof stringArray[0] !== "string")
//throw Error(`Unexpected return format from ${stateFilePath}`);
//return stringArray;
//};

let lastProgress: number;
function listMediaInDir(
  dir: string,
  updateProgress = (text: string, progress: number) => {
    if (progress !== lastProgress) {
      process.stdout.write(`${text}: ${progress}\r`);
      lastProgress = progress;
    }
  }
) {
  //const cachedReturn = getCachedReturn(dir);
  //if (cachedReturn) {
  //console.log(`DONE: getCachedReturn("${dir}")`);
  //return cachedReturn;
  //}

  let files: string[] = [];
  let processedFiles = 0;

  // Function to recursively traverse directories
  function traverseDirectory(directory: string) {
    fs.readdirSync(directory).forEach((file) => {
      const subPath = path.join(directory, file);
      if (!file.startsWith(".") && file !== "sorted") {
        if (fs.statSync(subPath).isDirectory()) {
          traverseDirectory(subPath);
        } else {
          files.push(subPath.replace(/^public\//, ""));
          processedFiles++;
          updateProgress("Registered files", processedFiles);
          //console.log(`File added: ${subPath.replace(/^public\//, "")}`);
        }
      }
    });
  }

  traverseDirectory(dir);
  console.log(`DONE: traverseDirectory("${dir}")`);

  //saveCacheReturn(dir, files);
  return files;
}

function fileNameToMediaType(filename: string): "other" | "image" | "video" {
  const extension = filename.split(".").reverse()[0];
  if (["jpg", "jpeg", "png"].includes(extension)) return "image";
  if (["mp4"].includes(extension)) return "video";
  return "other";
}

type Predicate<T> = (value: T, index: number, array: T[]) => Promise<boolean>;
const asyncFilter = async <T>(arr: T[], predicate: Predicate<T>) =>
  Promise.all(arr.map(predicate)).then((results) =>
    arr.filter((_v, index) => results[index])
  );

// TODO test sortedAs filter option
export async function getListOfFiles(sortedAs?: string) {
  const res = sortedAs
    ? asyncFilter(listMediaInDir("public"), async (mediaPath) => {
        const metadata = await getMetadata(mediaPath, new Date());
        return metadata?.state?.sortedAs === sortedAs;
      })
    : listMediaInDir("public");
  return res;
}

export async function getSortedNeighbors(mediaPath: string, _timestamp: Date) {
  const { state } = await getMetadata(mediaPath, new Date());
  const filesInSameCategory = await getListOfFiles(state.sortedAs);
  const currentIndex = filesInSameCategory.findIndex((e) => e === mediaPath);
  if (currentIndex === -1) return {};
  return {
    nextPathInCategory: filesInSameCategory[currentIndex + 1],
    prevPathInCategory: filesInSameCategory[currentIndex - 1],
  };
}

/**
 * @description provides all the information the app needs to navigate and display the files from the server.
 * @param mediaPath references the file path on the server
 * @param timestamp must be set to make sure caching will not hide state changes
 * @param [listFiles=listMediaInDir] the function which reads the file system on the server should only be replaced in the unit tests
 * */
export async function getMetadata(
  mediaPath: string,
  timestamp: Date,
  listFiles = listMediaInDir
) {
  const fsInfo = new FsInfo(listFiles("public"));
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  const mediaState = await loadMediaStateFromServer(
    dirPath,
    fileName,
    new Date()
  );
  return {
    timeOfRequest: timestamp,
    current: mediaPath,
    mediaType: fileNameToMediaType(mediaPath),
    exists: fsInfo.exists(mediaPath),
    nextPath: fsInfo.pathAfter(mediaPath),
    prevPath: fsInfo.pathBefore(mediaPath),
    state: mediaState,
  };
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type ServerMediaMetadata = UnwrapPromise<ReturnType<typeof getMetadata>>;
