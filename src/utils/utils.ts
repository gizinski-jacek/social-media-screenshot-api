export const createFilename = (
  handle: string,
  postId: string,
  cd: number = 0,
): string => {
  const filename = `${handle}__${postId}__cd-${cd}__${createTimestamp()}.jpeg`;
  return filename;
};

export const createTimestamp = (): string => {
  const timestamp = new Date()
    .toISOString()
    .slice(0, -5)
    .replaceAll(/:|\./g, '-');
  return timestamp;
};
