"use server";

import styles from "./page.module.css";
import { getListOfFiles } from "./server-actions/actions";
import Gallery from "./gallery";
import fs from "fs";
import { KeyActions } from "./keyboard-input/key-listener";
import Link from "next/link";

export default async function Home() {
  const fileList = await getListOfFiles();
  const max = 4;
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
      <Link className={styles.overview} href="/search">
        Go to Search
      </Link>
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
        const filesInDir = await getListOfFiles(directory);
        if (filesInDir.length == 0) return <></>;
        return (
          <>
            <h1 className={styles.h1} key={directory}>
              {directory}
            </h1>
            <Gallery fileList={filesInDir} />
          </>
        );
      })}
      <KeyActions pageType="overview" />
    </main>
  );
}
