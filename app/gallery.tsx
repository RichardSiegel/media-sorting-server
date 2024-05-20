import Link from "next/link";
import { filePrefix } from "./file/[...path]/prefix";
import styles from "./page.module.css";

export default function Gallery({ fileList }: { fileList: string[] }) {
  return (
    <div className={styles.gallery}>
      {fileList.map((file) => {
        const isImage = file.endsWith(".jpg") || file.endsWith(".png");
        const imageAsBackground = isImage
          ? { backgroundImage: `url('${filePrefix(file)}')` }
          : {};
        return (
          <Link key={file} href={`/file/${file}`}>
            <div className={styles.galleryImage} style={imageAsBackground}>
              <div>
                {!isImage &&
                  file
                    .split("/")
                    .map((part, i) => <p key={`part_${i}_${file}`}>{part}</p>)}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
