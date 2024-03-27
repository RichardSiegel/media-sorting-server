"use server";

import styles from "../../page.module.css";
import { GlobalKeyActions } from "@/app/keyboard-input/key-listener";

export default async function ShowMediaFilePage({
  params,
}: {
  params: { path: string[] };
}) {
  const path = params.path.join("/");
  const imageAsBackground = { backgroundImage: `url('/${path}')` };

  return (
    <div className={styles.fullscreenImage} style={imageAsBackground}>
      <GlobalKeyActions currentPath={path} />
    </div>
  );
}
