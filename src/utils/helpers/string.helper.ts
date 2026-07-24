import crypto from "crypto";

export default function generateUsername(name: string): string {
  // Step 1: Remove spaces and convert to lowercase
  let username = name.replace(/\s+/g, "").toLowerCase();
  username = username.substring(0, 4);
  // Step 2: Generate a random string (to make the username unique)
  const randomSuffix = crypto.randomBytes(3).toString("hex"); // 6-character random hex string

  // Step 3: Concatenate the random string with the user's name
  username = username + randomSuffix;

  // Step 4: Ensure the username has a reasonable length (5-15 characters)
  if (username.length < 5) {
    // If the username is too short, add additional random characters
    username = username + crypto.randomBytes(3).toString("hex");
  } else if (username.length > 15) {
    // If it's too long, truncate it to 15 characters
    username = username.substring(0, 15);
  }

  return username;
}

export function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str; // Check if the string is empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function convertToTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => capitalizeFirstLetter(txt));
}

export function convertToLowerCase(str: string): string {
  return str.toLowerCase();
}

export function convertToUpperCase(str: string): string {
  return str.toUpperCase();
}
