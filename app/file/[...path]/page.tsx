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
  const imageAsBackground = {
    backgroundImage: `url('${filePrefix(mediaPath)}')`,
  };

  switch (mediaType) {
    case "image":
      return (
        <div
          className={styles.fullscreenContainer}
          style={imageAsBackground}
          data-testid="fullscreenImage"
        >
          <NavigationElements
            prevPath={prevPath}
            nextPath={nextPath}
          ></NavigationElements>
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
