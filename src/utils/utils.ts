export const createFilename = (
  handle: string,
  postId: string,
  cd: number = 0,
): string => {
  const filename = `${handle}_${postId}_cd_${cd}_${createTimestamp()}.jpeg`;
  return filename;
};

export const createTimestamp = (): string => {
  const timestamp = new Date()
    .toISOString()
    .slice(0, -5)
    .replaceAll(/:|\./g, '-');
  return timestamp;
};
