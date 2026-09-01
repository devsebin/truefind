import fs from "fs";
import { getSignedUrl as cloudfrontGetSignedUrl } from "@aws-sdk/cloudfront-signer";

let privateKey = "";
try {
  if (process.env.CLOUDFRONT_PRIVATE_KEY_PATH && fs.existsSync(process.env.CLOUDFRONT_PRIVATE_KEY_PATH)) {
    privateKey = fs.readFileSync(process.env.CLOUDFRONT_PRIVATE_KEY_PATH, "utf8");
  }
} catch (e) {
  // Ignored in test/offline environments
}

export function generateCloudFrontSignedUrl(
  key: string,
  expiresInSeconds = 3600,
) {
  const url = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;

  return cloudfrontGetSignedUrl({
    url,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey,
    dateLessThan: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
  });
}

export function buildCloudFrontUrl(key: string) {
  return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
}

export function safeFileName(name: string) {
  return encodeURIComponent(name.replace(/\s+/g, "_"));
}
