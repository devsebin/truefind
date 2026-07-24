export const capitalize = (value: string) =>
  value.trim().charAt(0).toUpperCase() + value.trim().slice(1);

export function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str; // Check if the string is empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}
