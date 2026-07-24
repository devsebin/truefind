import crypto from "crypto";

const SECRET = process.env.OTP_SECRET || "supersecret";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

export const generateToken = (length: number) => {
  return crypto.randomBytes(length).toString("hex"); // Generates a random token
};

export const generateOTPExpiry = (minutes: number) => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + minutes); // OTP expires in 5 minutes
  return expiryTime;
};
export const hashOTP = (otp: string): string => {
  return crypto.createHmac("sha256", SECRET).update(otp).digest("hex");
};
export const isOTPValid = (
  otp: string,
  storedOtp: string,
  expiry: Date,
): boolean => {
  const currentTime = new Date();
  return otp === storedOtp && currentTime <= expiry;
};
export const isOTPExpired = (expiry: Date): boolean => {
  const currentTime = new Date();
  return currentTime > expiry;
};
export const isOTPAttemptsExceeded = (
  attempts: number,
  maxAttempts: number,
): boolean => {
  return attempts >= maxAttempts;
};

export const isOTPUsed = (isUsed: boolean): boolean => {
  return isUsed;
};

export const updateOTPAttempts = (attempts: number): number => {
  return attempts + 1;
};
