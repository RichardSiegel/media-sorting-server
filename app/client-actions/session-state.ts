import { extractPathAndName, isRunOnServer } from "../utils";

export const defaultMediaState = { isFavorite: false };
export type MediaState = typeof defaultMediaState;
type MediaStateKey = keyof MediaState;
export type MediaStateDir = { [key in string]?: MediaState };

/**
 * @description This overwrites the media states for the specified directory.
 * @param dirName name of the directory used as session storage item identifier.
 * @param state the new state for media items in directory.
 * @param browserWindow ONLY FOR MOCKING in unit tests
 * */
export const updateSessionState = (
  dirName: string,
  state: MediaStateDir,
  browserWindow = isRunOnServer ? undefined : window
) =>
  browserWindow?.sessionStorage?.setItem(
    dirName !== "" ? dirName : ".",
    JSON.stringify(state)
  );

/**
 * @description Loads all of the media states kept in the current browser session for the specified directory.
 * @param dirName name of the directory used as session storage item identifier.
 * @param browserWindow ONLY FOR MOCKING in unit tests
 * */
export const loadSessionState = (
  dirName: string,
  browserWindow = isRunOnServer ? undefined : window
) => {
  try {
    return JSON.parse(
      browserWindow?.sessionStorage?.getItem(dirName !== "" ? dirName : ".") ||
        "{}"
    ) as MediaStateDir;
  } catch {
    return {};
  }
};

/**
 * @description Loads a specific media state kept in the current browser session.
 * @param mediaPath path to the file whose state will be returned
 * @param stateName key to the specific state value that will be returned
 * @param getStateDir ONLY FOR MOCKING in unit tests
 * */
export const getMediaState = (
  mediaPath: string,
  stateName: MediaStateKey,
  getStateDir = loadSessionState
) => {
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  if (isRunOnServer) {
    return null;
    //return await loadMediaStateFromServer(dirPath, stateName);
  } else {
    return getStateDir(dirPath)[fileName]?.[stateName] ?? null;
    //return (getStateDir(dirPath)[fileName] || defaultMediaState)[stateName];
  }
};

/**
 * @description Saves a specific media state in the current browser session.
 * @param mediaPath path to the file whose state will be modified
 * @param stateName key to the specific state value that will be modified
 * @param getStateDir ONLY FOR MOCKING in unit tests
 * @param setStateDir ONLY FOR MOCKING in unit tests
 * */

export const setMediaState = <Key extends MediaStateKey>(
  mediaPath: string,
  stateName: Key,
  value: MediaState[Key],
  getStateDir = loadSessionState,
  setStateDir = updateSessionState
) => {
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  const oldStateInDir = getStateDir(dirPath) ?? {};
  const oldStateInFile = oldStateInDir[fileName] ?? defaultMediaState;
  const newStateInFile = { ...oldStateInFile, [stateName]: value };
  const newStateInDir = { ...oldStateInDir, [fileName]: newStateInFile };
  setStateDir(dirPath, newStateInDir);
};
