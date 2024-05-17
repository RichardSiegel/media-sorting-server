"use server";

import styles from "./page.module.css";
import { getListOfFiles } from "./server-actions/actions";
import Gallery from "./gallery";
import fs from "fs";

export default async function Home() {
  const fileList = await getListOfFiles();
  const max = 9;
  const oldestFiles = fileList.filter((_, i) => i < max);
  const latestFiles = fileList
    .reverse()
    .filter((_, i) => i < max)
    .reverse();
  const sortingCatetories = fs.existsSync("public/sorted")
    ? fs.readdirSync("public/sorted")
    : [];

  return (
    <main>
      {latestFiles.length === 0 ? (
        <h1 className={styles.doneH1}>All Your Pictures Are Sorted Below</h1>
      ) : (
        <>
          <h1 className={styles.h1}>Latest Files</h1>
          <Gallery fileList={latestFiles} />
          {!latestFiles.includes(oldestFiles[0]) && (
            <>
              <h1 className={styles.h1}>Oldest Files</h1>
              <Gallery fileList={oldestFiles} />
            </>
          )}
        </>
      )}
      {sortingCatetories.map(async (directory) => {
        return (
          <>
            <h1 className={styles.h1} key={directory}>
              {directory}
            </h1>
            <Gallery fileList={await getListOfFiles(directory)} />
          </>
        );
      })}
    </main>
  );
}
