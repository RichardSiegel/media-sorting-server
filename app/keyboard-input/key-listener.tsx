"use client";

import React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { EventKey, FunctionKeyMap, fnKeyToKeyFnMap } from "./types";
import { toggleFullscreen } from "../client-actions/browser-control";

const useKeyListener = async (functionKeyMap: FunctionKeyMap) => {
  const keyFunctionMap = fnKeyToKeyFnMap(functionKeyMap);
  const callbackForKey = ({ key }: KeyboardEvent) => {
    const keyEventHandler = keyFunctionMap[key as EventKey];
    keyEventHandler !== undefined && keyEventHandler();
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
  nextPath?: string;
  prevPath?: string;
};

export const KeyActions = (props: KeyActionProps) => {
  const { nextPath, prevPath } = props;
  const router = useRouter();

  const goTo = (path: string) => () => router.push(`/file/${path}`);
  const noOp = () => {};

  const goToNextMediaPath = !nextPath ? noOp : goTo(nextPath);
  const goToPreviousMediaPath = !prevPath ? noOp : goTo(prevPath);

  useKeyListener([
    [goToNextMediaPath, ["ArrowDown", "ArrowRight", "l"]],
    [goToPreviousMediaPath, ["ArrowLeft", "ArrowUp", "h"]],
    [toggleFullscreen, ["Enter", "f"]],
  ]);

  return <></>;
};
