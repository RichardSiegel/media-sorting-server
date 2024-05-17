"use client";

import Link from "next/link";
import { filePrefix, pagePrefix } from "./prefix";
import { KeyActions } from "@/app/keyboard-input/key-listener";
import styles from "../../page.module.css";
import { ServerMediaMetadata } from "@/app/server-actions/actions";
import { useMediaStateServerSync } from "./media-state-server-sync-hook";
import { useEffect, useState } from "react";

function LinkIfSet({
  href,
  testid,
  children,
}: Readonly<{
  href?: string;
  testid?: string;
  children: React.ReactNode;
}>) {
  return href ? (
    <Link className={styles.button} href={href} data-testid={testid}>
      {children}
    </Link>
  ) : (
    <div data-testid={testid}></div>
  );
}

/**
 * @description this will stop errors due to hydration mismatch between server
 * and client HTML-DOM. The flag "suppressHydrationWarning" can not be used to
 * replace this, since it is only for text-content and argument value changes,
 * not for differnt sub-trees in the HTML-DOM.
 * */
const useChangesAfterHydration = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted;
};

type Props = Readonly<{
  metadata: ServerMediaMetadata;
  children?: React.ReactNode;
}>;

export default function NavigationElements(props: Props) {
  const { metadata, children } = props;
  const mediaStateHook = useMediaStateServerSync(metadata);
  const afterHydration = useChangesAfterHydration();

  return (
    <div
      className={styles.controlOverlay}
      ref={mediaStateHook.resizeTriggerElementRef}
    >
      {metadata.viewingSortedFile ? (
        metadata.hardlinkToFile && (
          <Link
            className={styles.viewEditSwitch}
            href={`/file/${metadata.hardlinkToFile}`}
          >
            Go to Sorting/Edit Mode
          </Link>
        )
      ) : (
        <>
          {mediaStateHook.state?.sortedIntoPath && (
            <Link
              className={styles.viewEditSwitch}
              href={mediaStateHook.state?.sortedIntoPath}
            >
              {`View only "${mediaStateHook.state.sortedAs}" files`}
            </Link>
          )}
          {/* Buttons/show meta infos about images */}
          {afterHydration && (
            <div className={styles.sortOptions}>
              {mediaStateHook.sortOptions.map((option) => {
                return <div key={option}>{option}</div>;
              })}
            </div>
          )}
          <div
            className={styles.sortLabel}
            onClick={() => mediaStateHook.sortMedia()}
          >
            {mediaStateHook.state.sortedAs === undefined
              ? "sort"
              : `sorted: ${mediaStateHook.state.sortedAs}`}
          </div>
          <div
            className={styles.likeSwitch}
            onClick={mediaStateHook.toggleFavorite}
          >
            {mediaStateHook.state.isFavorite ? "Liked <3" : "Like"}
          </div>
        </>
      )}
      <Link className={styles.overview} href="/">
        Go to Overview
      </Link>
      {/* Buttons for click navigation and optinal content */}
      <LinkIfSet href={pagePrefix(metadata.prevPath)} testid="navigate-prev">
        {"<"}
      </LinkIfSet>
      <div>{children}</div>
      <LinkIfSet href={pagePrefix(metadata.nextPath)} testid="navigate-next">
        {">"}
      </LinkIfSet>
      {/* Add key shortcuts */}
      <KeyActions metadata={metadata} mediaStateHook={mediaStateHook} />
      {/* Preloading the next images */}
      {metadata.prevPath && (
        <link rel="preload" href={filePrefix(metadata.prevPath)} as="image" />
      )}
      {metadata.nextPath && (
        <link rel="preload" href={filePrefix(metadata.nextPath)} as="image" />
      )}
      {/* TODO: check if the type argument should be used here with image|video|text */}
      {/* https://www.w3schools.com/tags/att_link_type.asp */}
      {/* https://www.iana.org/assignments/media-types/media-types.xhtml */}
    </div>
  );
}
