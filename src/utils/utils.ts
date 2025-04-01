import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

export const createFilename = (
  service: string,
  handle: string,
  postId: string,
  timestamp: Date,
  cd?: number | undefined,
): string => {
  const filename = `${service}__${handle}__${postId}__cd-${cd || 0}__${formatTimestamp(timestamp)}.jpeg`;
  return filename;
};

export const formatTimestamp = (date: Date): string => {
  const timestamp = date.toISOString().replaceAll(/:|\./g, '-');
  return timestamp;
};

export const cleanUpDirectory = (dir: string) => {
  const files = readdirSync(dir);
  const filter = files.filter((file) => file !== '.gitkeep');
  for (const file of filter) {
    unlinkSync(join(dir, file));
  }
};
