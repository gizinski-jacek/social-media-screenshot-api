export const createTimestamp = (): string => {
  const timestamp = new Date()
    .toISOString()
    .slice(0, -5)
    .replaceAll(/:|\./g, '-');
  return timestamp;
};
