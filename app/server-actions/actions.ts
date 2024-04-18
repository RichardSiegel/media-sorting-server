"use server";
import fs from "fs";
import path from "path";

class FsInfo {
  private fileList: string[];

  private fileById = (id: number) =>
    id < this.fileList.length && id >= 0 ? this.fileList[id] : undefined;

  public constructor(fileList: string[]) {
    this.fileList = fileList;
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

function listMediaInDir(dir: string): string[] {
  let files: string[] = [];
  fs.readdirSync(dir).forEach((file) => {
    const subPath = path.join(dir, file);
    if (fs.statSync(subPath).isDirectory())
      files = [...files, ...listMediaInDir(subPath)];
    else files.push(subPath.replace(/^public\//, ""));
  });
  return files;
}

export async function getListOfFiles() {
  return listMediaInDir("public");
}

export async function getMetadata(mediaPath: string) {
  const fsInfo = new FsInfo(listMediaInDir("public"));
  return {
    current: mediaPath,
    exists: fsInfo.exists(mediaPath),
    nextPath: fsInfo.pathAfter(mediaPath),
    prevPath: fsInfo.pathBefore(mediaPath),
  };
}
