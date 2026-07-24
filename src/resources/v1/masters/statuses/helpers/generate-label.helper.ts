const generateLabel = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFKD")
    .replace(/[^\p{L}_]/gu, "")
    .toLowerCase();

export default generateLabel;
