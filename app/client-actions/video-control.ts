export const toggleVideoPlay = () => {
  const video = document.getElementsByTagName("video")[0];
  video.paused ? video.play() : video.pause();
};

export const jumpForwardInVideo = () => {
  const video = document.getElementsByTagName("video")[0];
  video.currentTime += 5;
};

export const jumpBackwardInVideo = () => {
  const video = document.getElementsByTagName("video")[0];
  video.currentTime -= 5;
};

export const increaseVideoPlaybackSpeed = () => {
  const video = document.getElementsByTagName("video")[0];
  video.playbackRate += 0.25;
  console.log(video.playbackRate);
};

export const decreaseVideoPlaybackSpeed = () => {
  const video = document.getElementsByTagName("video")[0];
  video.playbackRate -= 0.25;
  console.log(video.playbackRate);
};
