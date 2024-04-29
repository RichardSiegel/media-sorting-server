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

describe("setMediaState function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set the isFavorite state based on an empty initial state object", () => {
    const mediaPath = "path/to/media.jpg";
    const stateName = "isFavorite";
    const value = true;
    const initialState = {};
    const expectedStateCollection = {
      "path/to": {
        "media.jpg": {
          isFavorite: true,
        },
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
      expectedStateCollection
    );
  });

  it("should set the isFavorite state based on an incomplete initial state object", () => {
    const mediaPath = "path/to/media";
    const stateName = "isFavorite";
    const value = true;
    const initialState = {
      "path/to": {
        // Incomplete state for the 'media' file
      },
    };
    const expectedStateCollection = {
      "path/to": {
        media: {
          isFavorite: true,
        },
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
      expectedStateCollection
    );
  });

  it("should set the isFavorite state based on a complete initial state object", () => {
    const mediaPath = "path/to/media";
    const stateName = "isFavorite";
    const value = true;
    const initialState = {
      "path/to": {
        media: {
          // Complete state for the 'media' file
        },
      },
    };
    const expectedStateCollection = {
      "path/to": {
        media: {
          isFavorite: true,
        },
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
      expectedStateCollection
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
      "path/to": {
        media: {
          isFavorite: true,
        },
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
      "path/to": {
        media: {
          isFavorite: false,
        },
      },
    };
    const expectedState = false;

    loadSessionStateMock.mockReturnValueOnce(initialState);

    const result = getMediaState(mediaPath, stateName, loadSessionStateMock);

    expect(loadSessionStateMock).toHaveBeenCalled();
    expect(result).toEqual(expectedState);
  });
});

describe("updateSessionState function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store the provided state in the session storage", () => {
    const state = {
      "path/to": {
        media: {
          isFavorite: true,
        },
      },
    };

    updateSessionState(state, mockWindow);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "state",
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
      "path/to": {
        media: {
          isFavorite: true,
        },
      },
    };
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedState));

    const loadedState = loadSessionState(mockWindow);

    expect(mockSessionStorage.getItem).toHaveBeenCalledWith("state");
    expect(loadedState).toEqual(storedState);
  });

  it("should return an empty object if no state is stored", () => {
    mockSessionStorage.getItem.mockReturnValue(undefined); // Simulate no stored state

    const loadedState = loadSessionState(mockWindow);

    expect(mockSessionStorage.getItem).toHaveBeenCalledWith("state");
    expect(loadedState).toEqual({});
  });

  it("should handle invalid JSON in the stored state", () => {
    mockSessionStorage.getItem.mockReturnValue("invalidJSON");

    const loadedState = loadSessionState(mockWindow);

    expect(mockSessionStorage.getItem).toHaveBeenCalledWith("state");
    expect(loadedState).toEqual({});
  });
});
