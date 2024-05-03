import {
  getMediaState,
  loadSessionState,
  setMediaState,
} from "@/app/client-actions/session-state";
import { ServerMediaMetadata } from "@/app/server-actions/actions";
import {
  loadMediaStateFromServer,
  updateMediaStateOnServer,
} from "@/app/server-actions/media-state";
import { extractPathAndName } from "@/app/utils";
import { useEffect, useState } from "react";

export const useMediaStateServerSync = (metadata: ServerMediaMetadata) => {
  const { dirPath, fileName } = extractPathAndName(metadata.current);

  // Prepare state for UI
  const [isFavorite, setIsFavorite] = useState(
    getMediaState(metadata.current, "isFavorite") ?? metadata.isFavorite
  );

  // Set session storage, server state and ui state
  const setIsFavoriteServerSync = (state: boolean) => {
    // session storage
    setMediaState(metadata.current, "isFavorite", state);
    // server state
    updateMediaStateOnServer(dirPath, loadSessionState(dirPath)).then(() => {
      console.log("Server should be done saving");
    });
    //ui state
    setIsFavorite(state);
  };

  // only when this component is loaded
  useEffect(() => {
    // ask server for current state, if locale state is different from ssr-chached
    loadMediaStateFromServer(dirPath, fileName, new Date()).then((state) => {
      setMediaState(metadata.current, "isFavorite", state.isFavorite);
      setIsFavorite(state.isFavorite);
    });
  }, []);

  // prepare interface of custom hook
  const toggleFavorite = () => {
    setIsFavoriteServerSync(!isFavorite);
  };

  return { isFavorite, toggleFavorite };
};
