"use server";

import { getMetadata } from "@/app/server-actions/actions";
import styles from "../../page.module.css";
import { KeyActions } from "@/app/keyboard-input/key-listener";
import Link from "next/link";
import { filePrefix, pagePrefix } from "./prefix";

type Props = {
  params: { path: string[] };
};

export default async function ShowMediaFilePage({ params }: Props) {
  const mediaPath = params.path.join("/");
  const metadata = await getMetadata(mediaPath);
  //console.table(metadata); // This is helpful to see what is preloaded
  const { nextPath, prevPath } = metadata;
  const imageAsBackground = {
    backgroundImage: `url('${filePrefix(mediaPath)}')`,
  };

  return (
    <div
      className={styles.fullscreenImage}
      style={imageAsBackground}
      data-testid="fullscreenImage"
    >
      {/* Buttons for click navigation */}
      {prevPath ? <Link href={pagePrefix(prevPath)}>{"<"}</Link> : <div></div>}
      {nextPath ? <Link href={pagePrefix(nextPath)}>{">"}</Link> : <div></div>}

      {/* Add key shortcuts */}
      <KeyActions
        nextPath={pagePrefix(nextPath)}
        prevPath={pagePrefix(prevPath)}
      ></KeyActions>

      {/* Preloading the next images */}
      {<link rel="preload" href={filePrefix(prevPath)} as="image" />}
      {<link rel="preload" href={filePrefix(nextPath)} as="image" />}
    </div>
  );
}
