import styles from "../page.module.css";

const getByClass = (className: string) =>
  document.getElementsByClassName(className)[0] as HTMLElement;

/**
 * @deprecated This should be replaced by state based css clases for the rotations
 * */
function updateFullscreenCssRotation(
  outerContainer: HTMLElement,
  innerContainer: HTMLElement,
  degrees: 0 | 90 | 180 | 270 = 0
) {
  innerContainer.style.transform = `rotate(${degrees}deg)`;
  const changedRatio = degrees % 180 !== 0;
  innerContainer.style.height = changedRatio ? "100vw" : "100vh";
  innerContainer.style.width = changedRatio ? "100vh" : "100vw";
  //to reset values for resize-calculation
  outerContainer.style.top = "0px";
  outerContainer.style.left = "0px";
  // compute the offsets
  const innerRect = innerContainer.getBoundingClientRect();
  const outerRect = outerContainer.getBoundingClientRect();
  const offsetX = innerRect.x || outerRect.y;
  const offsetY = innerRect.y || outerRect.x;
  outerContainer.style.top = changedRatio ? `${offsetX}px` : "0px";
  outerContainer.style.left = changedRatio ? `${offsetY}px` : "0px";
  return degrees as 0 | 90 | 180 | 270;
}

/**
 * @deprecated This should be replaced by state based css clases for the rotations
 * */
export function rotateImage(degrees: number) {
  const deg = (degrees % 360) as 0 | 90 | 180 | 270;
  updateFullscreenCssRotation(
    getByClass(styles.outerFullscreenContainer),
    getByClass(styles.fullscreenContainer),
    deg
  );
}
