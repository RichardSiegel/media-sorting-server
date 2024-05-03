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

export async function updateMediaStateOnServer(
  dirPath: string,
  state: MediaStateDir
) {
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
