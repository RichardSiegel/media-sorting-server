import { describe, it, expect } from "vitest";
import { getListOfFiles, getMetadata } from "./actions";

const FILES = [
  "Bäume_1.jpg",
  "bäume_2.jpg",
  "sub dir/Bäume_1.jpg",
  "sub dir/schöner see.jpg",
  "von oben.jpg",
];

const fsMock = (_: string) => FILES;

describe("server actions", () => {
  describe("getListOfFiles", () => {
    it("should return list of files on the server", async () => {
      expect(await getListOfFiles()).toContain(FILES[0]);
      expect(await getListOfFiles()).toContain(FILES[1]);
      expect(await getListOfFiles()).toContain(FILES[2]);
      expect(await getListOfFiles()).toContain(FILES[3]);
      expect(await getListOfFiles()).toContain(FILES[4]);
    });
  });

  describe("getMetadata", () => {
    it("should say a file exists", async () => {
      expect((await getMetadata(FILES[0], fsMock)).exists).toBe(true);
    });

    it("should say a file does not exists", async () => {
      expect((await getMetadata("not-on-server.jpg", fsMock)).exists).toBe(
        false
      );
    });

    it("should provide correct previous file values", async () => {
      expect((await getMetadata(FILES[0], fsMock)).prevPath).toBeUndefined;
      expect((await getMetadata(FILES[1], fsMock)).prevPath).toBe(FILES[0]);
      expect((await getMetadata(FILES[2], fsMock)).prevPath).toBe(FILES[1]);
      expect((await getMetadata(FILES[3], fsMock)).prevPath).toBe(FILES[2]);
      expect((await getMetadata(FILES[4], fsMock)).prevPath).toBe(FILES[3]);
    });

    it("should provide correct next file values", async () => {
      expect((await getMetadata(FILES[0], fsMock)).nextPath).toBe(FILES[1]);
      expect((await getMetadata(FILES[1], fsMock)).nextPath).toBe(FILES[2]);
      expect((await getMetadata(FILES[2], fsMock)).nextPath).toBe(FILES[3]);
      expect((await getMetadata(FILES[3], fsMock)).nextPath).toBe(FILES[4]);
      expect((await getMetadata(FILES[4], fsMock)).nextPath).toBeUndefined;
    });

    it("should contain the current file path", async () => {
      expect((await getMetadata(FILES[0], fsMock)).current).toBe(FILES[0]);
      expect((await getMetadata(FILES[1], fsMock)).current).toBe(FILES[1]);
      expect((await getMetadata(FILES[2], fsMock)).current).toBe(FILES[2]);
      expect((await getMetadata(FILES[3], fsMock)).current).toBe(FILES[3]);
      expect((await getMetadata(FILES[4], fsMock)).current).toBe(FILES[4]);
    });

    it.each`
      fileName       | mediaType
      ${"file.jpg"}  | ${"image"}
      ${"file.jpeg"} | ${"image"}
      ${"file.png"}  | ${"image"}
      ${"file.mp4"}  | ${"video"}
      ${"file-mp4"}  | ${"other"}
      ${"file.txt"}  | ${"other"}
      ${"file.mp3"}  | ${"other"}
      ${"file.any"}  | ${"other"}
      ${"something"} | ${"other"}
    `(
      "should provide the mediaType $mediaType for files ending in $fileName",
      async ({ fileName, mediaType }) => {
        expect((await getMetadata(fileName, fsMock)).mediaType).toEqual(
          mediaType
        );
      }
    );
  });
});
