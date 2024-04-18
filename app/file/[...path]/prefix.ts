export const filePrefix = <T extends string | undefined>(path: T) =>
  (typeof path === "string" ? `/${path}` : undefined) as T;

export const pagePrefix = <T extends string | undefined>(path: T) =>
  (typeof path === "string" ? `/file/${path}` : undefined) as T;
