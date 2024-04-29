export const defaultMediaState = { isFavorite: false };
type MediaState = typeof defaultMediaState;
type MediaStateKey = keyof MediaState;
type MediaStateDir = { [key in string]?: MediaState };
type MediaStateCollection = { [key in string]?: MediaStateDir };

/**
 * @description This overwrites all of the media states kept in the current browser session.
 * @param state the new state for all media items on the page
 * @param browserWindow ONLY FOR MOCKING in unit tests
 * */
export const updateSessionState = (
  state: MediaStateCollection,
  // The typeof window !== "undefined" check is needed to eliminate runtime errors on the server
  browserWindow = typeof window !== "undefined" ? window : undefined
) => browserWindow?.sessionStorage?.setItem("state", JSON.stringify(state));

/**
 * @description Loads all of the media states kept in the current browser session.
 * @param browserWindow ONLY FOR MOCKING in unit tests
 * */
export const loadSessionState = (
  // The typeof window !== "undefined" check is needed to eliminate runtime errors on the server
  browserWindow = typeof window !== "undefined" ? window : undefined
) => {
  try {
    return JSON.parse(
      browserWindow?.sessionStorage?.getItem("state") || "{}"
    ) as MediaStateCollection;
  } catch {
    return {};
  }
};

/**
 * @description Loads a specific media state kept in the current browser session.
 * @param mediaPath path to the file whose state will be returned
 * @param stateName key to the specific state value that will be returned
 * @param getStateCollection ONLY FOR MOCKING in unit tests
 * */
export const getMediaState = (
  mediaPath: string,
  stateName: MediaStateKey,
  getStateCollection = loadSessionState
) => {
  const { dirPath: dir, fileName: file } = extractPathAndName(mediaPath);
  return (getStateCollection()[dir]?.[file] || defaultMediaState)[stateName];
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
 * @param getStateCollection ONLY FOR MOCKING in unit tests
 * @param setStateCollection ONLY FOR MOCKING in unit tests
 * */
export const setMediaState = <Key extends MediaStateKey>(
  mediaPath: string,
  stateName: Key,
  value: MediaState[Key],
  getStateCollection = loadSessionState,
  setStateCollection = updateSessionState
) => {
  const { dirPath, fileName } = extractPathAndName(mediaPath);
  const stateCollection = getStateCollection();
  const oldStateInFile =
    stateCollection[dirPath]?.[fileName] ?? defaultMediaState;
  const oldStateInDir = stateCollection[dirPath] ?? {};
  const newStateInFile = { ...oldStateInFile, [stateName]: value };
  const newStateInDir = { ...oldStateInDir, [fileName]: newStateInFile };
  stateCollection[dirPath] = newStateInDir;
  setStateCollection(stateCollection);
};
