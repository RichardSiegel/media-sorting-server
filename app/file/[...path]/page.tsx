"use server";

import { getMetadata } from "@/app/server-actions/actions";
import styles from "../../page.module.css";
import { KeyActions } from "@/app/keyboard-input/key-listener";

type Props = {
  params: { path: string[] };
};

export default async function ShowMediaFilePage({ params }: Props) {
  const mediaPath = params.path.join("/");
  const metadata = await getMetadata(mediaPath);
  const imageAsBackground = { backgroundImage: `url('/${mediaPath}')` };

  return (
    <div className={styles.fullscreenImage} style={imageAsBackground}>
      <KeyActions
        nextPath={metadata.nextPath}
        prevPath={metadata.prevPath}
      ></KeyActions>
    </div>
  );
}
