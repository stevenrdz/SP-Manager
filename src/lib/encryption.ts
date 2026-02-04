import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Key must be 32 bytes (256 bits)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Must be set in .env
const IV_LENGTH = 16; // AES block size

export const encryption = {
  encrypt(text: string): string {
    if (!text) return text;
    if (!ENCRYPTION_KEY) {
      console.warn('ENCRYPTION_KEY is not set. Using plain text fallback (NOT SECURE).');
      return text;
    }

    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Fallback to plain text to avoid data loss, or throw? Better to throw in prod but for now safer fallback.
    }
  },

  decrypt(text: string): string {
    if (!text) return text;
    if (!ENCRYPTION_KEY) return text;

    try {
      const textParts = text.split(':');
      if (textParts.length < 2) return text; // Not encrypted format

      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      // Often happens if key changed or text wasn't encrypted
      console.warn('Decryption failed, returning original text:', error);
      return text;
    }
  }
};
