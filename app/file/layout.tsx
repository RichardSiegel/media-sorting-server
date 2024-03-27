"use server";

import React from "react";
import fs from "fs";
import { ServerFilesContextProvider } from "../server-files-context";

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <ServerFilesContextProvider fileList={fs.readdirSync("public")}>
      {children}
    </ServerFilesContextProvider>
  );
}
