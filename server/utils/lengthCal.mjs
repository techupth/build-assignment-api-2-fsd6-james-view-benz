export const lengthCal = (content) => {
  if (!content) return "short";
  const length = content.length;
  if (length < 100) return "short";
  if (length >= 100 && length <= 500) return "medium";
  return "long";
};
