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
import { rotateImage } from "../client-actions/image-control";
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

type KeyActionProps = {
  metadata: ServerMediaMetadata;
  mediaStateHook: ReturnType<typeof useMediaStateServerSync>;
};

export const KeyActions = ({ metadata, mediaStateHook }: KeyActionProps) => {
  const { nextPath, prevPath } = metadata;
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
    [["s"], mediaStateHook.toggleFavorite],
    [["r", "t"], mediaStateHook.rotateMedia],
  ]);

  return <></>;
};
