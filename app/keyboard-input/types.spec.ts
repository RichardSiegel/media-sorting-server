import { describe, it, expect } from "vitest";
import { FunctionKeyMap, KeyFunctionMap, fnKeyToKeyFnMap } from "./types";

describe("fnKeyToKeyFnMap", () => {
  it("should convert FunctionKeyMap to KeyFunctionMap", () => {
    const nextFn = () => {};
    const prevFn = () => {};
    const fnKeyMap: FunctionKeyMap = [
      [["ArrowDown", "ArrowRight", "l"], nextFn],
      [["ArrowLeft", "ArrowUp", "h"], prevFn],
    ];
    const keyFnMap: KeyFunctionMap = {
      ArrowDown: { fn: nextFn, args: [] },
      ArrowLeft: { fn: prevFn, args: [] },
      ArrowRight: { fn: nextFn, args: [] },
      ArrowUp: { fn: prevFn, args: [] },
      h: { fn: prevFn, args: [] },
      l: { fn: nextFn, args: [] },
    };
    expect(fnKeyToKeyFnMap(fnKeyMap)).toEqual(keyFnMap);
  });

  it("should pass arguments into functions", () => {
    const exampleFn = () => {};
    const fnKeyMap: FunctionKeyMap = [
      [["e"], exampleFn, "value"],
      [["x"], exampleFn, "first", true, 3],
      [["f"], exampleFn, exampleFn],
    ];
    const keyFnMap: KeyFunctionMap = {
      e: { fn: exampleFn, args: ["value"] },
      x: { fn: exampleFn, args: ["first", true, 3] },
      f: { fn: exampleFn, args: [exampleFn] },
    };
    expect(fnKeyToKeyFnMap(fnKeyMap)).toEqual(keyFnMap);
  });
});
