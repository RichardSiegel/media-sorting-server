import styles from "./page.module.css";
import fs from "fs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const fileList = fs.readdirSync("public");
  return (
    <main className={styles.main}>
      {fileList.map((file) => (
        <Link key={file} href={`/file/${file}`}>
          <Image src={`/${file}`} alt={file} width={350} height={350} />
        </Link>
      ))}
    </main>
  );
}
