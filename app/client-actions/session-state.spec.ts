import { expect, it, beforeEach, describe, vi } from "vitest";
import {
  defaultMediaState,
  getMediaState,
  loadSessionState,
  setMediaState,
  updateSessionState,
} from "./session-state";

const mockSessionStorage = { setItem: vi.fn(), getItem: vi.fn() };
const mockWindow = { sessionStorage: mockSessionStorage } as unknown as Window &
  typeof globalThis;
const loadSessionStateMock = vi.fn(() => ({}));
const updateSessionStateMock = vi.fn();

describe("updateSessionState function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store the provided state in the session storage", () => {
    const state = { media: { isFavorite: true } };
    updateSessionState("path/to", state, mockWindow);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "path/to",
      JSON.stringify(state)
    );
  });

  it("should store the provided state in the session storage '.' if dir is an empty string", () => {
    const state = { media: { isFavorite: true } };
    updateSessionState("", state, mockWindow);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      ".",
      JSON.stringify(state)
    );
  });
});

describe("loadSessionState function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should retrieve the stored state from the session storage", () => {
    const storedState = {
      media: {
        isFavorite: true,
      },
    };
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedState));
    const loadedState = loadSessionState("path/to", mockWindow);
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith("path/to");
    expect(loadedState).toEqual(storedState);
  });

  it("should retrieve the stored state from the session storage if no sub-directory is in use", () => {
    const storedState = {
      media: {
        isFavorite: true,
      },
    };
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedState));
    const loadedState = loadSessionState("", mockWindow);
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(".");
    expect(loadedState).toEqual(storedState);
  });

  it("should return an empty object if no state is stored", () => {
    mockSessionStorage.getItem.mockReturnValue(undefined); // Simulate no stored state
    const loadedState = loadSessionState("", mockWindow);
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(".");
    expect(loadedState).toEqual({});
  });

  it("should handle invalid JSON in the stored state", () => {
    mockSessionStorage.getItem.mockReturnValue("invalidJSON");
    const loadedState = loadSessionState("", mockWindow);
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(".");
    expect(loadedState).toEqual({});
  });
});

describe("setMediaState function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set the isFavorite state based on an initial state object without the file the state is for", () => {
    const mediaPath = "path/to/media.jpg";
    const stateName = "isFavorite";
    const value = true;
    const initialState = { "someOtherFile.mp4": { isFavorite: false } };
    const expectedStateDir = {
      ...initialState,
      "media.jpg": { isFavorite: true },
    };

    loadSessionStateMock.mockReturnValueOnce(initialState);

    setMediaState(
      mediaPath,
      stateName,
      value,
      loadSessionStateMock,
      updateSessionStateMock
    );

    expect(loadSessionStateMock).toHaveBeenCalled();
    expect(updateSessionStateMock).toHaveBeenCalledWith(
      "path/to",
      expectedStateDir
    );
  });

  it("should set the isFavorite state based on a complete initial state object", () => {
    const mediaPath = "path/to/media";
    const stateName = "isFavorite";
    const value = true;
    const initialState = {
      media: {
        // Complete state for the 'media' file
      },
    };
    const expectedStateDir = {
      media: {
        isFavorite: true,
      },
    };

    loadSessionStateMock.mockReturnValueOnce(initialState);

    setMediaState(
      mediaPath,
      stateName,
      value,
      loadSessionStateMock,
      updateSessionStateMock
    );

    expect(loadSessionStateMock).toHaveBeenCalled();
    expect(updateSessionStateMock).toHaveBeenCalledWith(
      "path/to",
      expectedStateDir
    );
  });
});

describe("getMediaState function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the default state if nothing is set yet", () => {
    const mediaPath = "path/to/media";
    const stateName = "isFavorite";
    const expectedDefaultState = defaultMediaState[stateName];

    const result = getMediaState(mediaPath, stateName, loadSessionStateMock);

    expect(loadSessionStateMock).toHaveBeenCalled();
    expect(result).toEqual(expectedDefaultState);
  });

  it("should return the true state if it is set", () => {
    const mediaPath = "path/to/media";
    const stateName = "isFavorite";
    const initialState = {
      media: {
        isFavorite: true,
      },
    };
    const expectedState = true;

    loadSessionStateMock.mockReturnValueOnce(initialState);

    const result = getMediaState(mediaPath, stateName, loadSessionStateMock);

    expect(loadSessionStateMock).toHaveBeenCalled();
    expect(result).toEqual(expectedState);
  });

  it("should return the false state if it is set", () => {
    const mediaPath = "path/to/media";
    const stateName = "isFavorite";
    const initialState = {
      media: {
        isFavorite: false,
      },
    };
    const expectedState = false;

    loadSessionStateMock.mockReturnValueOnce(initialState);

    const result = getMediaState(mediaPath, stateName, loadSessionStateMock);

    expect(loadSessionStateMock).toHaveBeenCalled();
    expect(result).toEqual(expectedState);
  });
});
