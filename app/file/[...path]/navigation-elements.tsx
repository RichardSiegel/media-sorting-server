"use server";

import Link from "next/link";
import { filePrefix, pagePrefix } from "./prefix";
import { KeyActions } from "@/app/keyboard-input/key-listener";
import styles from "../../page.module.css";

function LinkIfSet({
  href,
  children,
}: Readonly<{
  href?: string;
  children: React.ReactNode;
}>) {
  return href ? (
    <Link className={styles.button} href={href}>
      {children}
    </Link>
  ) : (
    <div></div>
  );
}

type Props = Readonly<{
  prevPath?: string;
  nextPath?: string;
  children?: React.ReactNode;
}>;

export default async function NavigationElements(props: Props) {
  const { prevPath, nextPath, children } = props;
  return (
    <>
      {/* Buttons for click navigation and optinal content */}
      <LinkIfSet href={pagePrefix(prevPath)}>{"<"}</LinkIfSet>
      <div>{children}</div>
      <LinkIfSet href={pagePrefix(nextPath)}>{">"}</LinkIfSet>

      {/* Add key shortcuts */}
      <KeyActions
        nextPath={pagePrefix(nextPath)}
        prevPath={pagePrefix(prevPath)}
      ></KeyActions>

      {/* Preloading the next images */}
      {<link rel="preload" href={filePrefix(prevPath)} as="image" />}
      {<link rel="preload" href={filePrefix(nextPath)} as="image" />}
      {/* TODO: check if the type argument should be used here with image|video|text */}
      {/* https://www.w3schools.com/tags/att_link_type.asp */}
      {/* https://www.iana.org/assignments/media-types/media-types.xhtml */}
    </>
  );
}
