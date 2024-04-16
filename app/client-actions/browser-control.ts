export function toggleFullscreen() {
  const { documentElement, exitFullscreen, fullscreenElement } =
    window.document;

  if (!fullscreenElement) {
    documentElement.requestFullscreen.call(documentElement);
  } else {
    exitFullscreen.call(window.document);
  }
}
