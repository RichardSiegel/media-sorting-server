import { rotateImage } from "@/app/client-actions/image-control";
import {
  MediaState,
  getMediaStatesForFile,
  setMediaStatesForFile,
} from "@/app/client-actions/session-state";
import { ServerMediaMetadata } from "@/app/server-actions/actions";
import {
  loadMediaStateFromServer,
  updateMediaStateOnServer,
} from "@/app/server-actions/media-state";
import { extractPathAndName } from "@/app/utils";
import useResizeObserver from "@react-hook/resize-observer";
import { useEffect, useRef, useState } from "react";

export const useMediaStateServerSync = (metadata: ServerMediaMetadata) => {
  const { dirPath, fileName } = extractPathAndName(metadata.current);

  // Prepare state for UI
  const [state, setState] = useState(
    getMediaStatesForFile(metadata.current) ?? metadata.state
  );

  // Set session storage, server state and ui state
  const setStateServerSync = (stateChanges: Partial<MediaState>) => {
    // session storage
    const newStateDir = setMediaStatesForFile(metadata.current, stateChanges);
    // server state
    updateMediaStateOnServer(dirPath, newStateDir).then(() => {
      console.log("Server should be done saving");
    });
    //ui state
    const newStateFile = newStateDir[fileName];
    if (newStateFile !== undefined) setState(newStateFile);
  };

  const updateClientWithChangesFromServer = () => {
    // ask server for current state, if locale state is different from ssr-chached
    loadMediaStateFromServer(dirPath, fileName, new Date()).then((state) => {
      setMediaStatesForFile(metadata.current, state);
      setState(state);
      rotateImage(state.rotation);
    });
  };
  const resizeTriggerElementRef = useRef(null);
  useResizeObserver(resizeTriggerElementRef, () => rotateImage(state.rotation));

  // only when this component is loaded
  useEffect(updateClientWithChangesFromServer, []);

  // prepare interface of custom hook
  const toggleFavorite = () => {
    setStateServerSync({ ...state, isFavorite: !state.isFavorite });
  };

  const rotateMedia = () => {
    const rotation = ((state.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    setStateServerSync({ ...state, rotation });
    rotateImage(rotation);
  };

  // state = {isFavorite,...}
  return { resizeTriggerElementRef, state, toggleFavorite, rotateMedia };
};
