import { rotateImage } from "@/app/client-actions/image-control";
import {
  MediaState,
  getMediaStatesForFile,
  loadSessionShortCutsForSort,
  setMediaStatesForFile,
  updateSessionShortCutsForSort,
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
  const loadSessionShortCuts = () =>
    [
      ["[0]", loadSessionShortCutsForSort("0")],
      ["[1]", loadSessionShortCutsForSort("1")],
      ["[2]", loadSessionShortCutsForSort("2")],
      ["[3]", loadSessionShortCutsForSort("3")],
      ["[4]", loadSessionShortCutsForSort("4")],
      ["[5]", loadSessionShortCutsForSort("5")],
      ["[6]", loadSessionShortCutsForSort("6")],
      ["[7]", loadSessionShortCutsForSort("7")],
      ["[8]", loadSessionShortCutsForSort("8")],
      ["[9]", loadSessionShortCutsForSort("9")],
    ]
      .filter((item) => !!item[1])
      .map((item) => item.join(" "));
  const [sortOptions, setSortOptions] = useState(loadSessionShortCuts());

  // Set session storage, server state and ui state
  const setStateServerSync = (stateChanges: Partial<MediaState>) => {
    // session storage
    const newStateFile = setMediaStatesForFile(metadata.current, stateChanges);
    // server state
    updateMediaStateOnServer(metadata.current, newStateFile)
      .then(() => {
        console.log("Server should be done saving");
      })
      .catch((e) => {
        console.error(e);
        alert(e);
      });
    //ui state
    if (newStateFile !== undefined) setState(newStateFile);
  };

  const updateClientWithChangesFromServer = () => {
    // ask server for current state, if locale state is different from ssr-chached
    loadMediaStateFromServer(`public/${dirPath}`, fileName, new Date()).then(
      (state) => {
        setMediaStatesForFile(metadata.current, state);
        setState(state);
        rotateImage(state.rotation);
      }
    );
  };
  const resizeTriggerElementRef = useRef(null);
  useResizeObserver(resizeTriggerElementRef, () => rotateImage(state.rotation));

  // only when this component is loaded
  useEffect(updateClientWithChangesFromServer, []);

  // prepare interface of custom hook
  const toggleFavorite = () => {
    setStateServerSync({ isFavorite: !state.isFavorite });
  };

  const rotateMedia = () => {
    const rotation = ((state.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    setStateServerSync({ rotation });
    rotateImage(rotation);
  };

  const sortMedia = (categoryShortCut?: string) => {
    let categoryLabel = loadSessionShortCutsForSort(categoryShortCut);
    if (categoryShortCut === undefined || categoryLabel === state.sortedAs) {
      categoryLabel = prompt("New Sorting Label:") ?? undefined;
      updateSessionShortCutsForSort(categoryShortCut, categoryLabel);
    }
    setStateServerSync({ sortedAs: categoryLabel ?? undefined });
    setSortOptions(loadSessionShortCuts());
  };

  return {
    resizeTriggerElementRef,
    state,
    toggleFavorite,
    rotateMedia,
    sortMedia,
    sortOptions,
  };
};
