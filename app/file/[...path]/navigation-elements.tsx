"use client";

import Link from "next/link";
import { filePrefix, pagePrefix } from "./prefix";
import { KeyActions } from "@/app/keyboard-input/key-listener";
import styles from "../../page.module.css";
import { ServerMediaMetadata } from "@/app/server-actions/actions";
import { useState } from "react";
import {
  getMediaState,
  setMediaState,
} from "@/app/client-actions/session-state";

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
  metadata: ServerMediaMetadata;
  children?: React.ReactNode;
}>;

export default function NavigationElements(props: Props) {
  const { metadata, children } = props;
  const [isFavorite, setIsFavorite] = useState(
    getMediaState(metadata.current, "isFavorite")
  );

  const toggleFavorite = () => {
    setMediaState(metadata.current, "isFavorite", !isFavorite);
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      {/* Toggle/show meta infos about images */}
      <div className={styles.likeSwitch} onClick={toggleFavorite}>
        {isFavorite ? "Liked <3" : "Like"}
      </div>
      {/* Buttons for click navigation and optinal content */}
      <LinkIfSet href={pagePrefix(metadata.prevPath)}>{"<"}</LinkIfSet>
      <div>{children}</div>
      <LinkIfSet href={pagePrefix(metadata.nextPath)}>{">"}</LinkIfSet>
      {/* Add key shortcuts */}
      <KeyActions
        metadata={metadata}
        toggleFavorite={toggleFavorite}
      ></KeyActions>
      {/* Preloading the next images */}
      {<link rel="preload" href={filePrefix(metadata.prevPath)} as="image" />}
      {<link rel="preload" href={filePrefix(metadata.nextPath)} as="image" />}
      {/* TODO: check if the type argument should be used here with image|video|text */}
      {/* https://www.w3schools.com/tags/att_link_type.asp */}
      {/* https://www.iana.org/assignments/media-types/media-types.xhtml */}
    </>
  );
}
