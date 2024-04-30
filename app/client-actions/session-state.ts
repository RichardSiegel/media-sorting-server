export const defaultMediaState = { isFavorite: false };
type MediaState = typeof defaultMediaState;
type MediaStateKey = keyof MediaState;
type MediaStateDir = { [key in string]?: MediaState };

/**
 * @description This overwrites the media states for the specified directory.
 * @param dirName name of the directory used as session storage item identifier.
 * @param state the new state for media items in directory.
 * @param browserWindow ONLY FOR MOCKING in unit tests
 * */
export const updateSessionState = (
  dirName: string,
  state: MediaStateDir,
  // The typeof window !== "undefined" check is needed to eliminate runtime errors on the server
  browserWindow = typeof window !== "undefined" ? window : undefined
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
  // The typeof window !== "undefined" check is needed to eliminate runtime errors on the server
  browserWindow = typeof window !== "undefined" ? window : undefined
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
  const { dirPath: dir, fileName: file } = extractPathAndName(mediaPath);
  return (getStateDir(dir)[file] || defaultMediaState)[stateName];
};

const extractPathAndName = (mediaPath: string) => {
  const [fileName, ...reverseDirParts] = mediaPath.split("/").reverse();
  const dirPath = (reverseDirParts || []).reverse().join("/");
  return { dirPath, fileName };
};

/**
 * @description Saves a specific media state in the current browser session.
 * @param mediaPath path to the file whose state will be modified
 * @param stateName key to the specific state value that will be modified
 * @param getStateDir ONLY FOR MOCKING in unit tests
 * @param setStateCollection ONLY FOR MOCKING in unit tests
 * */
export const setMediaState = <Key extends MediaStateKey>(
  mediaPath: string,
  stateName: Key,
  value: MediaState[Key],
  getStateDir = loadSessionState,
  setStateCollection = updateSessionState
) => {
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  const oldStateInDir = getStateDir(dirPath) ?? {};
  const oldStateInFile = oldStateInDir[fileName] ?? defaultMediaState;
  const newStateInFile = { ...oldStateInFile, [stateName]: value };
  const newStateInDir = { ...oldStateInDir, [fileName]: newStateInFile };
  setStateCollection(dirPath, newStateInDir);
  // TODO save on server
};
