import { describe, it, expect } from "vitest";
import { FunctionKeyMap, KeyFunctionMap, fnKeyToKeyFnMap } from "./types";

describe("fnKeyToKeyFnMap", () => {
  it("should convert FunctionKeyMap to KeyFunctionMap", () => {
    const nextFn = () => {};
    const prevFn = () => {};
    const fnKeyMap: FunctionKeyMap = [
      [nextFn, ["ArrowDown", "ArrowRight", "l"]],
      [prevFn, ["ArrowLeft", "ArrowUp", "h"]],
    ];
    const keyFnMap: KeyFunctionMap = {
      ArrowDown: nextFn,
      ArrowLeft: prevFn,
      ArrowRight: nextFn,
      ArrowUp: prevFn,
      h: prevFn,
      l: nextFn,
    };
    expect(fnKeyToKeyFnMap(fnKeyMap)).toEqual(keyFnMap);
  });
});
