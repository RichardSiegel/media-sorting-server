"use server";

import { getMetadata } from "@/app/server-actions/actions";
import styles from "../../page.module.css";
import { KeyActions } from "@/app/keyboard-input/key-listener";
import Link from "next/link";

type Props = {
  params: { path: string[] };
};

function prefix<T extends string | undefined>(path: T) {
  return (typeof path === "string" ? `/file/${path}` : undefined) as T;
}

export default async function ShowMediaFilePage({ params }: Props) {
  const mediaPath = params.path.join("/");
  const metadata = await getMetadata(mediaPath);
  //console.table(metadata); // This is helpful to see what is preloaded
  const { nextPath, prevPath } = metadata;
  const imageAsBackground = { backgroundImage: `url('/${mediaPath}')` };

  return (
    <div
      className={styles.fullscreenImage}
      style={imageAsBackground}
      data-testid="fullscreenImage"
    >
      {/* Buttons for click navigation */}
      {prevPath ? <Link href={prefix(prevPath)}>{"<"}</Link> : <div></div>}
      {nextPath ? <Link href={prefix(nextPath)}>{">"}</Link> : <div></div>}

      {/* Add key shortcuts */}
      <KeyActions
        nextPath={prefix(nextPath)}
        prevPath={prefix(prevPath)}
      ></KeyActions>

      {/* Preloading the next images */}
      {prevPath && <link rel="preload" href={`/${prevPath}`} as="image" />}
      {nextPath && <link rel="preload" href={`/${nextPath}`} as="image" />}
    </div>
  );
}
