"use server";
import fs from "fs";
import {
  MediaState,
  MediaStateDir,
  defaultMediaState,
} from "../client-actions/session-state";
import { extractPathAndName } from "../utils";
import { revalidatePath } from "next/cache";

const stateFileFor = (dirPath: string) =>
  `${
    dirPath !== "" ? decodeURI(dirPath) : "."
  }/.media-sorting-server-state.json`;

const loadDirStateFromFile = (path: string) => {
  if (!fs.existsSync(path)) return {} as MediaStateDir;
  return JSON.parse(fs.readFileSync(path).toString()) as MediaStateDir;
};

export async function loadMediaStateFromServer(
  dirPath: string,
  fileName: string,
  _timestamp: Date // This should make sure the function is not cached, since the input changes
): Promise<MediaState> {
  const stateFilePath = stateFileFor(dirPath);
  return loadDirStateFromFile(stateFilePath)[fileName] ?? defaultMediaState;
}

// TODO Improve Security: This would write to any path, also relative ones!
const ensurePathExists = (path: string) => {
  if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
};

const removeEmptyDirs = (path: string) => {
  const pathSigments = path.split("/");
  const idOfSortedDir = pathSigments.indexOf("sorted");
  for (let i = pathSigments.length - 1; i > idOfSortedDir; i--) {
    const dirToRemoveIfEmpty = pathSigments
      .filter((_, index) => index <= i)
      .join("/");
    if (fs.readdirSync(dirToRemoveIfEmpty).length === 0)
      fs.rmdirSync(dirToRemoveIfEmpty);
  }
};

const saveJsonToFile = (
  filePath: string,
  json: Object,
  writeFile = fs.writeFile
) =>
  writeFile(filePath, JSON.stringify(json), (err) => {
    if (err) console.error(`Error writing file ${filePath}:`, err);
    else console.log(`Successfully saved ${filePath}`);
  });

const iNode = (path: string) => fs.statSync(path).ino;

const modifyFilenameIfRedundant = (
  fileName: string,
  targetDir: string,
  sourceDirForHardlinkCheck?: string,
  testable = {
    iNodeForFile: iNode,
    fileExists: fs.existsSync,
  }
) => {
  if (sourceDirForHardlinkCheck) {
    const targetFile = `${targetDir}/${fileName}`;
    const sourceFile = `${sourceDirForHardlinkCheck}/${fileName}`;
    const sourceInode = testable.iNodeForFile(sourceFile);
    const [extension, ...revertedRest] = fileName.split(".").reverse();
    const baseFileName = revertedRest.reverse().join(".");
    const alternativeFileName = `${baseFileName}_${sourceInode}.${extension}`;
    if (testable.fileExists(`${targetDir}/${alternativeFileName}`)) {
      return alternativeFileName;
    }
    if (
      testable.fileExists(targetFile) &&
      testable.iNodeForFile(targetFile) !== sourceInode
    ) {
      return alternativeFileName;
    }
  }
  return fileName;
};

export const updateFileStateInDirectoryStateFile = (
  newFileState: MediaState | null,
  fileName: string,
  targetDir: string,
  sourceDirForHardlinkCheck?: string,
  testable = {
    saveJsonFile: saveJsonToFile,
    loadDirState: loadDirStateFromFile,
    deleteFile: fs.unlinkSync,
    iNodeForFile: iNode,
    fileExists: fs.existsSync,
  }
) => {
  const targetFileName = modifyFilenameIfRedundant(
    fileName,
    targetDir,
    sourceDirForHardlinkCheck,
    testable
  );
  const dirPath = targetDir;
  const stateFilePath = stateFileFor(dirPath);
  const oldFileState = testable.loadDirState(stateFilePath);
  if (newFileState)
    testable.saveJsonFile(stateFilePath, {
      ...oldFileState,
      [targetFileName]: newFileState,
    });
  else {
    const fileStateWithoutFile = { ...oldFileState };
    delete fileStateWithoutFile[targetFileName];
    const isEmptyDirState = !Object.keys(fileStateWithoutFile).length;
    if (isEmptyDirState) testable.deleteFile(stateFilePath);
    else testable.saveJsonFile(stateFilePath, fileStateWithoutFile);
  }
};

const removeHardlinkInDiretory = (
  sourceDir: string,
  targetDir: string,
  fileName: string
) => {
  const targetFileName = modifyFilenameIfRedundant(
    fileName,
    targetDir,
    sourceDir
  );
  fs.unlinkSync(`${targetDir}/${targetFileName}`);
};

const createHardlinkInDiretory = (
  sourceDir: string,
  targetDir: string,
  fileName: string
) => {
  const targetFileName = modifyFilenameIfRedundant(
    fileName,
    targetDir,
    sourceDir
  );
  const targetFilePath = `${targetDir}/${targetFileName}`;
  ensurePathExists(`${targetDir}`);
  if (!fs.existsSync(targetFilePath))
    fs.linkSync(`${sourceDir}/${fileName}`, targetFilePath);
  return targetFilePath;
};

export async function updateMediaStateOnServer(
  filePath: string,
  newFileState: MediaState,
  testable = {
    loadFileState: loadMediaStateFromServer,
    updateDirState: updateFileStateInDirectoryStateFile,
    createHardlink: createHardlinkInDiretory,
    removeHardlink: removeHardlinkInDiretory,
    // TODO write tests that dirs are cleand up if emptied
    clenupEmptyDirs: removeEmptyDirs,
    revalidatePath: revalidatePath,
  }
) {
  const { dirPath, fileName } = extractPathAndName(`public/${filePath}`);
  const oldFileState = await testable.loadFileState(
    dirPath,
    fileName,
    new Date()
  );
  const newSortedAs = newFileState.sortedAs;
  const newSortedDir = `public/sorted/${newSortedAs}`;
  const oldSortedAs = oldFileState.sortedAs;
  const oldSortedDir = `public/sorted/${oldSortedAs}`;

  if (newSortedAs !== oldSortedAs) {
    if (newSortedAs) {
      const pathOnServer = testable.createHardlink(
        dirPath,
        newSortedDir,
        fileName
      );
      newFileState.sortedIntoPath = pathOnServer
        .split("/")
        .filter((segment) => segment !== "public")
        .join("/");
    } else newFileState.sortedIntoPath = undefined;

    if (oldSortedAs) {
      testable.updateDirState(null, fileName, oldSortedDir, dirPath);
      testable.removeHardlink(dirPath, oldSortedDir, fileName);
    }
  }

  if (newSortedAs) {
    testable.updateDirState(newFileState, fileName, newSortedDir, dirPath);
  }

  testable.updateDirState(newFileState, fileName, dirPath);

  if (oldSortedAs) testable.clenupEmptyDirs(oldSortedDir);
  if (newSortedAs) testable.clenupEmptyDirs(newSortedDir);

  testable.revalidatePath("/");
  testable.revalidatePath("/file/[path]/", "page");

  return newFileState.sortedIntoPath;
}
