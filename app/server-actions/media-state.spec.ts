import { describe, it, expect, vitest } from "vitest";
import {
  updateFileStateInDirectoryStateFile,
  updateMediaStateOnServer,
} from "./media-state";
import {
  MediaState,
  MediaStateDir,
  defaultMediaState,
} from "../client-actions/session-state";
import { PathLike } from "node:fs";

describe("updateMediaStateOnServer", () => {
  const exampleDirState: MediaStateDir = {
    "file-sortedAs-undefined.png": { ...defaultMediaState },
    "other.jpg": { ...defaultMediaState },
    "file-non-defualt.png": {
      isFavorite: true,
      rotation: 180,
      sortedAs: "category",
    },
  };

  const defaultTestableFn = {
    loadFileState: async (
      _dirPath: string,
      fileName: string,
      _timestamp: Date
    ) => exampleDirState[fileName] ?? defaultMediaState,
    updateDirState: vitest.fn(),
    createHardlink: vitest.fn(),
    removeHardlink: vitest.fn(),
    clenupEmptyDirs: vitest.fn(),
  };

  it("saves a directory media state for a file", async () => {
    const updateDirState = vitest.fn();
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      exampleDirState["file-non-defualt.png"] as MediaState,
      {
        ...defaultTestableFn,
        updateDirState,
      }
    );
    expect(updateDirState).toHaveBeenCalledWith(
      exampleDirState["file-non-defualt.png"] as MediaState,
      "file-non-defualt.png",
      "public/some/path/to/a"
    );
  });

  it("creates hardlink in sortedAs category if sortedAs changed", async () => {
    const createHardlink = vitest.fn();
    const oldFileState = exampleDirState["file-non-defualt.png"] as MediaState;
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      { ...oldFileState, sortedAs: "new-category" },
      { ...defaultTestableFn, createHardlink }
    );
    expect(createHardlink).toHaveBeenCalled();
    expect(createHardlink).toHaveBeenCalledOnce();
    expect(createHardlink).toHaveBeenCalledWith(
      "public/some/path/to/a",
      "public/sorted/new-category",
      "file-non-defualt.png"
    );
  });

  it("will not create hardlink in sortedAs category if sortedAs changed to undefined", async () => {
    const createHardlink = vitest.fn();
    const oldFileState = exampleDirState[
      "file-non-defualt.png"
    ] as unknown as MediaState;
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      { ...oldFileState, sortedAs: undefined },
      { ...defaultTestableFn, createHardlink }
    );
    expect(createHardlink).not.toHaveBeenCalled();
  });

  it("will not create hardlink in sortedAs category if sortedAs remained unchanged", async () => {
    const createHardlink = vitest.fn();
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      exampleDirState["file-non-defualt.png"] as MediaState,
      {
        ...defaultTestableFn,
        createHardlink,
      }
    );
    expect(createHardlink).not.toHaveBeenCalled();
  });

  it("deletes hardlink for old sortedAs category if sortedAs changed", async () => {
    const removeHardlink = vitest.fn();
    const oldFileState = exampleDirState[
      "file-non-defualt.png"
    ] as unknown as MediaState;
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      { ...oldFileState, sortedAs: "new-category" },
      { ...defaultTestableFn, removeHardlink }
    );
    expect(removeHardlink).toHaveBeenCalled();
    expect(removeHardlink).toHaveBeenCalledOnce();
    expect(removeHardlink).toHaveBeenCalledWith(
      "public/some/path/to/a",
      "public/sorted/category",
      "file-non-defualt.png"
    );
  });

  it("will not try to delete hardlink for old sortedAs category if old sortedAs is undefined", async () => {
    const removeHardlink = vitest.fn();
    const oldFileState = exampleDirState[
      "file-non-defualt.png"
    ] as unknown as MediaState;
    await updateMediaStateOnServer(
      "some/path/to/a/file-sortedAs-undefined.png",
      { ...oldFileState, sortedAs: "new-category" },
      { ...defaultTestableFn, removeHardlink }
    );
    expect(removeHardlink).not.toHaveBeenCalled();
  });

  it("modifies media state in state-file in the new sorting category directory if category changed", async () => {
    const updateDirState = vitest.fn();
    const oldFileState = exampleDirState["file-non-defualt.png"] as MediaState;
    const newFileState = { ...oldFileState, sortedAs: "new-category" };
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      newFileState,
      { ...defaultTestableFn, updateDirState }
    );
    expect(updateDirState).toHaveBeenCalledWith(
      newFileState,
      "file-non-defualt.png",
      "public/sorted/new-category",
      "public/some/path/to/a"
    );
  });

  it("modifies media state in the state-file in the sorting category directory if e.g. rotation changes", async () => {
    const updateDirState = vitest.fn();
    const oldFileState = exampleDirState["file-non-defualt.png"] as MediaState;
    const newFileState: MediaState = { ...oldFileState, rotation: 90 };
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      newFileState,
      { ...defaultTestableFn, updateDirState }
    );
    expect(updateDirState).toHaveBeenCalledWith(
      newFileState,
      "file-non-defualt.png",
      "public/sorted/category",
      "public/some/path/to/a"
    );
  });

  it("will not try to modify the state-file in the sorting category directory sortedAs is undefined", async () => {
    const updateDirState = vitest.fn();
    const oldFileState = exampleDirState[
      "file-sortedAs-undefined.png"
    ] as MediaState;
    const newFileState: MediaState = { ...oldFileState, rotation: 90 };
    await updateMediaStateOnServer(
      "some/path/to/a/file-sortedAs-undefined.png",
      newFileState,
      { ...defaultTestableFn, updateDirState }
    );
    expect(updateDirState).not.toHaveBeenCalledWith(
      "sorted/category/file-sortedAs-undefined.png",
      newFileState
    );
  });

  it("removes media state from state-file in the old sorting category directory, if category is changed", async () => {
    const updateDirState = vitest.fn();
    const oldFileState = exampleDirState["file-non-defualt.png"] as MediaState;
    const newFileState: MediaState = {
      ...oldFileState,
      sortedAs: "new-category",
    };
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      newFileState,
      { ...defaultTestableFn, updateDirState }
    );
    expect(updateDirState).toHaveBeenCalledWith(
      null,
      "file-non-defualt.png",
      "public/sorted/category",
      "public/some/path/to/a"
    );
  });

  it("will not try to remove media state from old state-file if sorting category did not change", async () => {
    const updateDirState = vitest.fn();
    const oldFileState = exampleDirState["file-non-defualt.png"] as MediaState;
    const newFileState: MediaState = { ...oldFileState, isFavorite: true };
    await updateMediaStateOnServer(
      "some/path/to/a/file-non-defualt.png",
      newFileState,
      { ...defaultTestableFn, updateDirState }
    );
    expect(updateDirState).not.toHaveBeenCalledWith(
      "sorted/category/file-non-defualt.png",
      null
    );
  });

  it("will not try to remove media state from old state-file if sorting category changed, but old category is undefined", async () => {
    const updateDirState = vitest.fn();
    const oldFileState = exampleDirState[
      "file-sortedAs-undefined.png"
    ] as MediaState;
    const newFileState: MediaState = {
      ...oldFileState,
      sortedAs: "new-category",
    };
    await updateMediaStateOnServer(
      "some/path/to/a/file-sortedAs-undefined.png",
      newFileState,
      { ...defaultTestableFn, updateDirState }
    );
    expect(updateDirState).not.toHaveBeenCalledWith(
      "sorted/undefined/file-sortedAs-undefined.png",
      null
    );
  });
});

describe("updateFileStateInDirectoryStateFile", () => {
  const alteredFileState: MediaState = {
    isFavorite: true,
    rotation: 180,
    sortedAs: "category",
  };

  const defaultTestableFn = {
    saveJsonFile: vitest.fn(),
    loadDirState: vitest.fn(),
    deleteFile: vitest.fn(),
    iNodeForFile: (path: string) =>
      path.includes("used-by-file-with-same-name") ? 666 : 42,
    fileExists: (_path: PathLike) => true,
  };

  describe("if no state file exists", () => {
    it("create file with state under correct path and filename", () => {
      const saveJsonFile = vitest.fn();
      updateFileStateInDirectoryStateFile(
        defaultMediaState,
        "filename.mp4",
        "a/new/file/path",
        undefined, // this may not be relevant for this test
        { ...defaultTestableFn, saveJsonFile }
      );
      expect(saveJsonFile).toHaveBeenCalledOnce();
      expect(saveJsonFile).toHaveBeenCalledWith(
        "a/new/file/path/.media-sorting-server-state.json",
        { "filename.mp4": defaultMediaState }
      );
    });
  });

  describe("if state file exists", () => {
    describe("and replacement names are needed", () => {
      const exampleDirState: MediaStateDir = {
        "changed.jpg": alteredFileState,
        "filename.mp4": defaultMediaState,
        "42_filename.mp4": defaultMediaState,
        "other.png": defaultMediaState,
      };
      let loadDirState = (_path: string) => exampleDirState;

      it("update file with new state without altering other files states", () => {
        const saveJsonFile = vitest.fn();
        updateFileStateInDirectoryStateFile(
          alteredFileState,
          "filename.mp4",
          "sorted/category-path-used-by-file-with-same-name",
          "source/path",
          { ...defaultTestableFn, saveJsonFile, loadDirState }
        );
        expect(saveJsonFile).toHaveBeenCalledOnce();
        expect(saveJsonFile).toHaveBeenCalledWith(
          "sorted/category-path-used-by-file-with-same-name/.media-sorting-server-state.json",
          { ...exampleDirState, "42_filename.mp4": alteredFileState }
        );
      });

      it("delete state from file if file state is set to null", () => {
        const saveJsonFile = vitest.fn();
        updateFileStateInDirectoryStateFile(
          null,
          "filename.mp4",
          "sorted/category-path-used-by-file-with-same-name",
          "source/path",
          { ...defaultTestableFn, saveJsonFile, loadDirState }
        );
        const exampleDirStateWithoutFilenameMp4 = { ...exampleDirState };
        // @ts-ignore
        delete exampleDirStateWithoutFilenameMp4["42_filename.mp4"];
        expect(saveJsonFile).toHaveBeenCalledOnce();
        expect(saveJsonFile).toHaveBeenCalledWith(
          "sorted/category-path-used-by-file-with-same-name/.media-sorting-server-state.json",
          exampleDirStateWithoutFilenameMp4
        );
      });

      it("delete state file if it was emptied by file-entry removal", () => {
        const singleEntryExample = { "42_filename.mp4": defaultMediaState };
        loadDirState = (_path: string) => singleEntryExample;
        const saveJsonFile = vitest.fn();
        const deleteFile = vitest.fn();
        updateFileStateInDirectoryStateFile(
          null,
          "filename.mp4",
          "sorted/category-path-used-by-file-with-same-name",
          "source/path",
          { ...defaultTestableFn, saveJsonFile, loadDirState, deleteFile }
        );
        expect(saveJsonFile).not.toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledWith(
          "sorted/category-path-used-by-file-with-same-name/.media-sorting-server-state.json"
        );
      });
    });

    describe("and no replacement names are needed", () => {
      const exampleDirState: MediaStateDir = {
        "changed.jpg": alteredFileState,
        "filename.mp4": defaultMediaState,
        "other.png": defaultMediaState,
      };
      let loadDirState = (_path: string) => exampleDirState;

      it("update file with new state without altering other files states", () => {
        const saveJsonFile = vitest.fn();
        updateFileStateInDirectoryStateFile(
          alteredFileState,
          "filename.mp4",
          "a/new/file/path",
          undefined, // this may not be relevant for this test
          { ...defaultTestableFn, saveJsonFile, loadDirState }
        );
        expect(saveJsonFile).toHaveBeenCalledOnce();
        expect(saveJsonFile).toHaveBeenCalledWith(
          "a/new/file/path/.media-sorting-server-state.json",
          { ...exampleDirState, "filename.mp4": alteredFileState }
        );
      });

      it("delete state from file if file state is set to null", () => {
        const saveJsonFile = vitest.fn();
        updateFileStateInDirectoryStateFile(
          null,
          "filename.mp4",
          "a/new/file/path",
          undefined, // this may not be relevant for this test
          { ...defaultTestableFn, saveJsonFile, loadDirState }
        );
        const exampleDirStateWithoutFilenameMp4 = { ...exampleDirState };
        // @ts-ignore
        delete exampleDirStateWithoutFilenameMp4["filename.mp4"];
        expect(saveJsonFile).toHaveBeenCalledOnce();
        expect(saveJsonFile).toHaveBeenCalledWith(
          "a/new/file/path/.media-sorting-server-state.json",
          exampleDirStateWithoutFilenameMp4
        );
      });

      it("delete state file if it was emptied by file-entry removal", () => {
        const singleEntryExample = { "filename.mp4": defaultMediaState };
        loadDirState = (_path: string) => singleEntryExample;
        const saveJsonFile = vitest.fn();
        const deleteFile = vitest.fn();
        updateFileStateInDirectoryStateFile(
          null,
          "filename.mp4",
          "a/new/file/path",
          undefined, // this may not be relevant for this test
          { ...defaultTestableFn, saveJsonFile, loadDirState, deleteFile }
        );
        expect(saveJsonFile).not.toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledWith(
          "a/new/file/path/.media-sorting-server-state.json"
        );
      });
    });
  });
});
