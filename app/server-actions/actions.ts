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
        }
      }
    });
  }

  traverseDirectory(dir);

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

export async function getListOfFiles(sortedAs?: string) {
  const res = sortedAs
    ? listMediaInDir(`public/sorted/${sortedAs}`)
    : listMediaInDir("public");
  return res;
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
  const viewingSortedFiles = mediaPath.startsWith("sorted/");
  const fsInfo = viewingSortedFiles
    ? new FsInfo(listFiles(`public/sorted/${mediaPath.split("/")[1] ?? ""}`))
    : new FsInfo(listFiles("public"));
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  const mediaState = await loadMediaStateFromServer(
    `public/${dirPath}`,
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
    viewingSortedFile: viewingSortedFiles,
    hardlinkToFile:
      mediaState.firstPathOnServer &&
      fs.existsSync(`public/${mediaState.firstPathOnServer}`)
        ? mediaState.firstPathOnServer
        : undefined,
  };
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type ServerMediaMetadata = UnwrapPromise<ReturnType<typeof getMetadata>>;
