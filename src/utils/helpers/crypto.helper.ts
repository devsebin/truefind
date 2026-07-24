import crypto from "crypto";
import { COOKIE_SECRET } from "@/utils/validate-env";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export class EncryptedCookieService {
  private key: Buffer;

  constructor() {
    this.key = crypto.createHash("sha256").update(COOKIE_SECRET).digest();
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString();
  }
}
