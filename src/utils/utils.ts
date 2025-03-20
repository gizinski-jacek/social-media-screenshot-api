export const createFilename = (
  handle: string,
  postId: string,
  timestamp: Date,
  cd?: number | undefined,
): string => {
  const filename = `${handle}__${postId}__cd-${cd || 0}__${formatTimestamp(timestamp)}.jpeg`;
  return filename;
};

export const formatTimestamp = (date: Date): string => {
  const timestamp = date.toISOString().replaceAll(/:|\./g, '-');
  return timestamp;
};
