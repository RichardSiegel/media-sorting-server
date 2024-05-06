"use server";

import { ServerMediaMetadata, getMetadata } from "@/app/server-actions/actions";
import styles from "../../page.module.css";
import { filePrefix } from "./prefix";
import NavigationElements from "./navigation-elements";

type Props = {
  params: { path: string[] };
};

export default async function ShowMediaFilePage({ params }: Props) {
  const mediaPath = params.path.join("/");
  const metadata = await getMetadata(mediaPath, new Date());
  //console.table(metadata); // This is helpful to see what is preloaded

  return (
    <>
      <NavigationElements metadata={metadata} />
      <MediaDisplay mediaPath={mediaPath} metadata={metadata} />
    </>
  );
}

function MediaDisplay({
  mediaPath,
  metadata,
}: {
  mediaPath: string;
  metadata: ServerMediaMetadata;
}) {
  switch (metadata.mediaType) {
    case "video":
      return (
        <div className={styles.outerFullscreenContainer}>
          <div className={styles.fullscreenContainer}>
            <video autoPlay={true} src={filePrefix(mediaPath)} />;
          </div>
        </div>
      );

    case "image":
      return (
        <div className={styles.outerFullscreenContainer}>
          <div
            className={styles.fullscreenContainer}
            style={{
              backgroundImage: `url('${filePrefix(mediaPath)}')`,
            }}
          />
        </div>
      );

    case "other":
      return (
        <div className={styles.fullscreenContainer}>
          <h1>Unsupported Media Type</h1>
          <h2>{mediaPath}</h2>
        </div>
      );

    default: // TODO make this go to 404 pages
      return (
        <div className={styles.fullscreenContainer}>
          <h1>Did not find:</h1>
          <h2>{mediaPath}</h2>
        </div>
      );
  }
}
