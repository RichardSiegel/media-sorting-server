export type EventKey =
  | "Enter"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "ArrowDown"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type KeyFunctionMap = { [key in EventKey]?: () => void };

export type FunctionKeyMap = Array<[() => void, EventKey[]]>;

export const fnKeyToKeyFnMap = (fnKeyMap: FunctionKeyMap): KeyFunctionMap => {
  const keyEventHandlers: KeyFunctionMap = {};
  fnKeyMap.forEach(([fn, keys]) =>
    keys.forEach((key) => (keyEventHandlers[key] = fn))
  );
  return keyEventHandlers;
};
