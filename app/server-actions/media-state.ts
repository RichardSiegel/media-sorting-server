"use server";
import fs from "fs";
import {
  MediaState,
  MediaStateDir,
  defaultMediaState,
} from "../client-actions/session-state";

const stateFileFor = (dirPath: string) =>
  `public/${
    dirPath !== "" ? decodeURI(dirPath) : "."
  }/.media-sorting-server-state.json`;

export async function loadMediaStateFromServer(
  dirPath: string,
  fileName: string,
  _timestamp: Date // This should make sure the function is not cached, since the input changes
): Promise<MediaState> {
  const stateFilePath = stateFileFor(dirPath);
  if (!fs.existsSync(stateFilePath)) return defaultMediaState;
  return (
    JSON.parse(fs.readFileSync(stateFilePath).toString())[fileName] ??
    defaultMediaState
  );
}

// TODO Improve Security: This would write to any path, also relative ones!
const ensurePathExists = (path: string) => {
  if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
};

const iNode = (filePath: string) => fs.statSync(filePath).ino;

const isHardlink = (filePathA: string, filePathB: string) =>
  iNode(filePathA) === iNode(filePathB);

// TODO test:
// should hardlink targetFile to sourceFile, if no targetFile found
// should not do anything, if targetFile to same inode is found
// should create alternative hardlink to sourceFile, if targetFile (with same name) to different inode is found
// should not do anything, if alternative hardlink already exists
// should replace alternative hardlink with normal hardlink, if normal target does not exist.
const ensureHardLinkExists = (
  sourceDir: string,
  targetDir: string,
  fileName: string
) => {
  const source = `${sourceDir}/${fileName}`;
  const target = `${targetDir}/${fileName}`;
  const alternativeTarget = `${targetDir}/${iNode(source)}_${fileName}`;
  if (!fs.existsSync(target)) {
    // create Hardlink
    fs.linkSync(source, target);
    // remove alternativeTarget if used for same target
    // (this may happen if this file was first linked, while the target name was taken)
    if (
      fs.existsSync(alternativeTarget) &&
      isHardlink(target, alternativeTarget)
    )
      fs.unlinkSync(alternativeTarget);
  } else {
    // create additional link if there is not a hardlink to the same file
    // isHardlink===true does not require any action
    if (!isHardlink(source, target))
      if (!fs.existsSync(alternativeTarget)) {
        fs.linkSync(source, alternativeTarget);
      } else {
        // isHardlink===true does not require any action
        if (!isHardlink(source, alternativeTarget))
          throw Error(
            `Failed to create file link in "${targetDir}".
The fallback filename starting with the iNode is already taken for filename "${alternativeTarget}"`
          );
      }
  }
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

const ensureHardlinkIsRemoved = (
  originalPath: string,
  oldHardlinkPath: string,
  fileName: string
) => {
  const original = `${originalPath}/${fileName}`;
  const hardlink = `${oldHardlinkPath}/${fileName}`;
  if (fs.existsSync(hardlink)) {
    if (isHardlink(original, hardlink)) {
      fs.unlinkSync(hardlink);
      removeEmptyDirs(oldHardlinkPath);
    } else {
      throw Error(
        `not removing file, since it is not a hardlink: ${hardlink} (iNode did not match: ${original})`
      );
    }
  } else {
    console.warn(`Hardlink was not found for delete operation: ${hardlink}`);
  }
};

const updateSortedHardlink = async (
  dirPath: string,
  fileName: string,
  state: MediaStateDir
) => {
  const oldFileState = await loadMediaStateFromServer(
    dirPath,
    fileName,
    new Date()
  );
  const fileState = state[fileName];
  const originalPath = `public/${dirPath}`;
  // ensure only hardlinks for sorted files are created
  if (fileState?.sortedAs) {
    const sortIntoPath = `public/sorted/${fileState.sortedAs}`;
    console.table({
      fn: "createSortedHardlink",
      dirPath,
      fileName,
      newPath: sortIntoPath,
    });
    ensurePathExists(sortIntoPath);
    ensureHardLinkExists(originalPath, sortIntoPath, fileName);
  }
  // delete old hardlink if sortedAs chached
  if (
    oldFileState?.sortedAs &&
    oldFileState?.sortedAs !== fileState?.sortedAs
  ) {
    // remove hardlink to old sorting dir if it exists
    const oldHardlink = `public/sorted/${oldFileState.sortedAs}`;
    ensureHardlinkIsRemoved(originalPath, oldHardlink, fileName);
  }
};

export async function updateMediaStateOnServer(
  dirPath: string,
  state: MediaStateDir,
  fileName: string
) {
  await updateSortedHardlink(dirPath, fileName, state);
  const stateFilePath = stateFileFor(dirPath);
  fs.writeFile(stateFilePath, JSON.stringify(state), (err) => {
    if (err) {
      console.error(
        `Error writing file ${dirPath === "" ? "." : dirPath}:`,
        err
      );
    } else {
      console.log(
        `State saved successfully for ${dirPath === "" ? "." : dirPath}`
      );
    }
  });
}
