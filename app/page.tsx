"use server";

import styles from "./page.module.css";
import { getListOfFiles } from "./server-actions/actions";
import Gallery from "./gallery";

export default async function Home() {
  const fileList = await getListOfFiles();
  const max = 9;
  const oldestFiles = fileList.filter((_, i) => i < max);
  const latestFiles = fileList.reverse().filter((_, i) => i < max);

  return (
    <main>
      <h1 className={styles.h1}>Latest Files</h1>
      <Gallery fileList={latestFiles} />
      {!latestFiles.includes(oldestFiles[0]) && (
        <>
          <h1 className={styles.h1}>Oldest Files</h1>{" "}
          <Gallery fileList={oldestFiles} />
        </>
      )}
    </main>
  );
}
