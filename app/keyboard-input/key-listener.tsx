"use client";

import React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { FileState, ServerFilesContextConsumer } from "../server-files-context";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { EventKey, KeyEventHandlers } from "./types";

const useKeyListener = (keyEventHandlers: KeyEventHandlers) => {
  const callbackForKey = (event: KeyboardEvent) => {
    const keyEventHandler = keyEventHandlers[event.key as EventKey];
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

type KeyContextProps = {
  context: FileState;
  currentPath: string;
  router: AppRouterInstance;
};

const showNextFile = ({ context, currentPath, router }: KeyContextProps) => {
  const nextPath = context.pathAfter(currentPath);
  nextPath != undefined ? router.push(nextPath) : alert("no more files");
};

const showPreviousFile = ({
  context,
  currentPath,
  router,
}: KeyContextProps) => {
  const prevPath = context.pathBefore(currentPath);
  prevPath != undefined ? router.push(prevPath) : alert("no more files");
};

const KeyActionsWithContext = (props: KeyContextProps) => {
  useKeyListener({
    ArrowDown: () => showNextFile(props),
    ArrowLeft: () => showPreviousFile(props),
    ArrowRight: () => showNextFile(props),
    ArrowUp: () => showPreviousFile(props),
  });
  return <></>;
};

export const GlobalKeyActions = (props: { currentPath: string }) => {
  const router = useRouter();
  return (
    <ServerFilesContextConsumer>
      {(filesContext) => (
        <KeyActionsWithContext
          context={filesContext}
          currentPath={props.currentPath}
          router={router}
        />
      )}
    </ServerFilesContextConsumer>
  );
};
