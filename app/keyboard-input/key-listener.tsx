"use client";

import React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { EventKey, FunctionKeyMap, fnKeyToKeyFnMap } from "./types";
import { toggleFullscreen } from "../client-actions/browser-control";
import {
  toggleVideoPlay,
  jumpForwardInVideo,
  jumpBackwardInVideo,
  increaseVideoPlaybackSpeed,
  decreaseVideoPlaybackSpeed,
} from "../client-actions/video-control";
import { ServerMediaMetadata } from "../server-actions/actions";
import { pagePrefix } from "../file/[...path]/prefix";
import { useMediaStateServerSync } from "../file/[...path]/media-state-server-sync-hook";

const useKeyListener = async (functionKeyMap: FunctionKeyMap) => {
  const keyFunctionMap = fnKeyToKeyFnMap(functionKeyMap);
  const callbackForKey = ({ key }: KeyboardEvent) => {
    const keyEventHandler = keyFunctionMap[key as EventKey];
    keyEventHandler !== undefined &&
      keyEventHandler.fn(...keyEventHandler.args);
  };

  // implement the callback ref pattern
  const callbackForKeyRef = useRef(callbackForKey);
  useLayoutEffect(() => {
    callbackForKeyRef.current = callbackForKey;
  });

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    callbackForKeyRef.current(event);
  }, []);

  useEffect(() => {
    document && document.addEventListener("keydown", handleKeyPress);

    return () =>
      document && document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
};

type OverviewKeyActionProps = { pageType: "overview" };
type FullscreenViewerKeyActionProps = {
  pageType: "fullscreenViewer";
  metadata: ServerMediaMetadata;
  mediaStateHook: ReturnType<typeof useMediaStateServerSync>;
};
type KeyActionProps = OverviewKeyActionProps | FullscreenViewerKeyActionProps;

export const KeyActions = (props: KeyActionProps) => {
  const router = useRouter();
  const goTo = (path: string) => path && router.push(path);

  let activeKeyBindes: FunctionKeyMap = [[["f"], toggleFullscreen]];

  switch (props.pageType) {
    case "overview": {
      const navigationKeyBindes: FunctionKeyMap = [];
      activeKeyBindes = [...activeKeyBindes, ...navigationKeyBindes];
      break;
    }

    case "fullscreenViewer": {
      const { mediaStateHook, metadata } =
        props as FullscreenViewerKeyActionProps;

      const sortedFileOrOriginal = metadata.viewingSortedFile
        ? metadata.hardlinkToFile
        : mediaStateHook.state.sortedIntoPath;

      const navigationKeyBindes: FunctionKeyMap = [
        [["o"], goTo, "/"],
        [["ArrowRight", "l"], goTo, pagePrefix(metadata.nextPath)],
        [["ArrowLeft", "h"], goTo, pagePrefix(metadata.prevPath)],
        [["e"], goTo, pagePrefix(sortedFileOrOriginal)],
      ];

      const videoKeyBindes: FunctionKeyMap = [
        [["k"], toggleVideoPlay],
        [["."], jumpForwardInVideo],
        [[","], jumpBackwardInVideo],
        [[">"], increaseVideoPlaybackSpeed],
        [["<"], decreaseVideoPlaybackSpeed],
      ];

      const editKeyBindes: FunctionKeyMap = [
        [["s"], mediaStateHook.toggleFavorite],
        [["r"], mediaStateHook.rotateMedia],
        [["0"], mediaStateHook.sortMedia, "0"],
        [["1"], mediaStateHook.sortMedia, "1"],
        [["2"], mediaStateHook.sortMedia, "2"],
        [["3"], mediaStateHook.sortMedia, "3"],
        [["4"], mediaStateHook.sortMedia, "4"],
        [["5"], mediaStateHook.sortMedia, "5"],
        [["6"], mediaStateHook.sortMedia, "6"],
        [["7"], mediaStateHook.sortMedia, "7"],
        [["8"], mediaStateHook.sortMedia, "8"],
        [["9"], mediaStateHook.sortMedia, "9"],
      ];

      activeKeyBindes = [
        ...activeKeyBindes,
        ...navigationKeyBindes,
        ...(metadata.mediaType === "video" ? videoKeyBindes : []),
        ...(!metadata.viewingSortedFile ? editKeyBindes : []),
      ];
    }
  }

  useKeyListener(activeKeyBindes);

  return <></>;
};
