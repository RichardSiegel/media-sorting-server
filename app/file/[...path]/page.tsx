"use server";

import { getMetadata } from "@/app/server-actions/actions";
import styles from "../../page.module.css";
import { filePrefix } from "./prefix";
import NavigationElements from "./navigation-elements";

type Props = {
  params: { path: string[] };
};

export default async function ShowMediaFilePage({ params }: Props) {
  const mediaPath = params.path.join("/");
  const metadata = await getMetadata(mediaPath);
  //console.table(metadata); // This is helpful to see what is preloaded
  const { mediaType, nextPath, prevPath } = metadata;

  switch (mediaType) {
    case "video":
      return (
        <div className={styles.fullscreenVideo}>
          <div className={styles.videoOverlay}>
            <NavigationElements prevPath={prevPath} nextPath={nextPath} />
          </div>
          <video autoPlay={true} src={filePrefix(mediaPath)} />
        </div>
      );

    case "image":
      return (
        <div
          className={styles.fullscreenContainer}
          style={{ backgroundImage: `url('${filePrefix(mediaPath)}')` }}
          data-testid="fullscreenImage"
        >
          <NavigationElements prevPath={prevPath} nextPath={nextPath} />
        </div>
      );

    default:
      return (
        <div className={styles.fullscreenContainer}>
          <NavigationElements prevPath={prevPath} nextPath={nextPath}>
            <h1>Unsupported Media Type</h1>
            <h2>{mediaPath}</h2>
          </NavigationElements>
        </div>
      );
  }
}
