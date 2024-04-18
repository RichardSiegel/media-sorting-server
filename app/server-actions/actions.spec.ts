import { describe, it, expect } from "vitest";
import { getListOfFiles, getMetadata } from "./actions";

const FILES = [
  "Bäume_1.jpg",
  "bäume_2.jpg",
  "sub dir/Bäume_1.jpg",
  "sub dir/schöner see.jpg",
  "von oben.jpg",
];

describe("server actions", () => {
  describe("getListOfFiles", () => {
    it("should return list of files on the server", async () => {
      expect(await getListOfFiles()).toEqual(FILES);
    });
  });
  describe("getMetadata", () => {
    it("should say a file exists", async () => {
      expect((await getMetadata(FILES[0])).exists).toBe(true);
    });
    it("should say a file does not exists", async () => {
      expect((await getMetadata("not-on-server.jpg")).exists).toBe(false);
    });
    it("should provide correct previous file values", async () => {
      expect((await getMetadata(FILES[0])).prevPath).toBeUndefined;
      expect((await getMetadata(FILES[1])).prevPath).toBe(FILES[0]);
      expect((await getMetadata(FILES[2])).prevPath).toBe(FILES[1]);
      expect((await getMetadata(FILES[3])).prevPath).toBe(FILES[2]);
      expect((await getMetadata(FILES[4])).prevPath).toBe(FILES[3]);
    });
    it("should provide correct next file values", async () => {
      expect((await getMetadata(FILES[0])).nextPath).toBe(FILES[1]);
      expect((await getMetadata(FILES[1])).nextPath).toBe(FILES[2]);
      expect((await getMetadata(FILES[2])).nextPath).toBe(FILES[3]);
      expect((await getMetadata(FILES[3])).nextPath).toBe(FILES[4]);
      expect((await getMetadata(FILES[4])).nextPath).toBeUndefined;
    });
    it("should contain the current file path", async () => {
      expect((await getMetadata(FILES[0])).current).toBe(FILES[0]);
      expect((await getMetadata(FILES[1])).current).toBe(FILES[1]);
      expect((await getMetadata(FILES[2])).current).toBe(FILES[2]);
      expect((await getMetadata(FILES[3])).current).toBe(FILES[3]);
      expect((await getMetadata(FILES[4])).current).toBe(FILES[4]);
    });
  });
});
