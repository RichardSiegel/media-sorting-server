import Gallery from "../gallery";
import { useEffect, useState } from "react";
import { getListOfFiles } from "../server-actions/actions";
import styles from "../page.module.css";
import Link from "next/link";

export default function Search({}: {}) {
  const [fileList, setFileList] = useState<string[]>([]);
  useEffect(() => {
    getListOfFiles().then(setFileList);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div className={styles.searchInputBox}>
        <span>Search</span>
        <input type="text" onChange={(e) => setSearchTerm(e.target.value)} />
        <span>
          <Link href="/">Overview</Link>
        </span>
      </div>
      <Gallery
        fileList={fileList.filter((path) => path.includes(searchTerm))}
      />
    </>
  );
}
