export type EventKey =
  | "Enter"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "ArrowDown"
  | "."
  | ","
  | ">"
  | "<"
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
  | "z"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type KeyFunctionMap = {
  [key in EventKey]?: { fn: (...args: any) => void; args: any[] };
};

/**
 * @description every entry in this array is made of an array of keys, which
 * trigger a function, which may be provided with arguments. All such entries
 * are structured as arrays, containing key(s), function, arguments(optional).
 */
export type FunctionKeyMap = Array<
  [EventKey[], (...args: any) => void, ...any[]]
>;

export const fnKeyToKeyFnMap = (fnKeyMap: FunctionKeyMap): KeyFunctionMap => {
  const keyEventHandlers: KeyFunctionMap = {};
  fnKeyMap.forEach(([keys, fn, ...args]) =>
    keys.forEach((key) => (keyEventHandlers[key] = { fn, args }))
  );
  return keyEventHandlers;
};
