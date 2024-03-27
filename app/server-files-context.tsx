"use client";

import React from "react";

export class FileState {
  private fileList: string[];

  private fileById = (id: number) =>
    id < this.fileList.length && id >= 0 ? this.fileList[id] : undefined;

  public constructor(fileList: string[]) {
    this.fileList = fileList;
  }

  public pathBefore = (currentPath: string) =>
    this.fileById(this.fileList.indexOf(currentPath) - 1);

  public pathAfter = (currentPath: string) =>
    this.fileById(this.fileList.indexOf(currentPath) + 1);
}

const ServerFilesContext = React.createContext(new FileState([]));
ServerFilesContext.displayName = "ServerFilesContext";

export const ServerFilesContextConsumer = ServerFilesContext.Consumer;

export const ServerFilesContextProvider = ({
  children,
  fileList,
}: React.PropsWithChildren<{ fileList: string[] }>) => {
  return (
    <ServerFilesContext.Provider value={new FileState(fileList)}>
      {children}
    </ServerFilesContext.Provider>
  );
};
