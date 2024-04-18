import { describe, it, expect } from "vitest";
import { filePrefix, pagePrefix } from "./prefix";

describe("On /file/.. pages", () => {
  describe("filePrefix", () => {
    it("should prefix links to other files with /file/", () => {
      expect(filePrefix("path/filename")).toEqual("/path/filename");
    });

    it("should not create string if prefix is used on undefined", () => {
      expect(filePrefix(undefined)).toEqual(undefined);
    });
  });

  describe("pagePrefix", () => {
    it("should prefix links to other files with /file/", () => {
      expect(pagePrefix("path/filename")).toEqual("/file/path/filename");
    });

    it("should not create string if prefix is used on undefined", () => {
      expect(pagePrefix(undefined)).toEqual(undefined);
    });
  });
});
