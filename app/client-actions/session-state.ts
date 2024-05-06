import { extractPathAndName, isRunOnServer } from "../utils";

export const defaultMediaState = {
  isFavorite: false,
  rotation: 0 as 0 | 90 | 180 | 270,
};
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
  lss = loadSessionState
) => getMediaStatesForFile(mediaPath, lss)?.[stateName] ?? null;

/**
 * @description Loads the media state kept in the current browser session for a file.
 * @param mediaPath path to the file whose state will be returned
 * @param getStateDir ONLY FOR MOCKING in unit tests
 * */
export const getMediaStatesForFile = (
  mediaPath: string,
  getStateDir = loadSessionState
) => {
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  return isRunOnServer ? null : getStateDir(dirPath)[fileName] ?? null;
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
  lss = loadSessionState,
  uss = updateSessionState
) => setMediaStatesForFile(mediaPath, { [stateName]: value }, lss, uss);

/**
 * @description Saves the media state in the current browser session for a file.
 * @param mediaPath path to the file whose state will be modified
 * @param stateChanges state object holding only the values that should be updated
 * @param getStateDir ONLY FOR MOCKING in unit tests
 * @param setStateDir ONLY FOR MOCKING in unit tests
 * */
export const setMediaStatesForFile = (
  mediaPath: string,
  stateChanges: Partial<MediaState>,
  getStateDir = loadSessionState,
  setStateDir = updateSessionState
) => {
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  const oldStateInDir = getStateDir(dirPath) ?? {};
  const oldStateInFile = oldStateInDir[fileName] ?? defaultMediaState;
  const newStateInFile = { ...oldStateInFile, ...stateChanges };
  const newStateInDir = { ...oldStateInDir, [fileName]: newStateInFile };
  setStateDir(dirPath, newStateInDir);
  return newStateInDir;
};
