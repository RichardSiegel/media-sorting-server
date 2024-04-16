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

  public pathBefore = (currentPath: string) =>
    this.fileById(this.fileList.indexOf(decodeURI(currentPath)) - 1);

  public pathAfter = (currentPath: string) =>
    this.fileById(this.fileList.indexOf(decodeURI(currentPath)) + 1);
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

export async function getMetadata(mediaPath: string) {
  const fsInfo = new FsInfo(listMediaInDir("public"));
  return {
    current: mediaPath,
    nextPath: fsInfo.pathAfter(mediaPath),
    prevPath: fsInfo.pathBefore(mediaPath),
  };
}
