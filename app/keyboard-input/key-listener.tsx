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
import { getMediaState, setMediaState } from "../client-actions/session-state";

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

type KeyActionProps = {
  metadata: ServerMediaMetadata;
};

const toggleFavorite = (path: string) => {
  const isFavorite = getMediaState(path, "isFavorite");
  setMediaState(path, "isFavorite", !isFavorite);
  console.log(window.sessionStorage.getItem("state"));
};

export const KeyActions = ({ metadata }: KeyActionProps) => {
  const { current, nextPath, prevPath } = metadata;
  const router = useRouter();
  const goTo = (path: string) => path && router.push(path);

  useKeyListener([
    [["ArrowDown", "ArrowRight", "l"], goTo, pagePrefix(nextPath)],
    [["ArrowLeft", "ArrowUp", "h"], goTo, pagePrefix(prevPath)],
    [["Enter", "f"], toggleFullscreen],
    [["k"], toggleVideoPlay],
    [["."], jumpForwardInVideo],
    [[","], jumpBackwardInVideo],
    [[">"], increaseVideoPlaybackSpeed],
    [["<"], decreaseVideoPlaybackSpeed],
    [["s"], toggleFavorite, current],
  ]);

  return <></>;
};
