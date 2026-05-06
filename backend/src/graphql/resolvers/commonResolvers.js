// resolvers/commonResolvers.js
// - uploadImage / uploadVerificationDocument → Bunny Storage (CDN URL)
// - uploadVideo → Bunny Stream (HLS embed URL + Video ID)

import GraphQLJSON from 'graphql-type-json';
import { GraphQLUpload } from 'graphql-upload';
import fs from 'fs';
import path from 'path';
import { uploadToBunny } from '../../utils/uploadToBunny.js';
import { uploadToBunnyStream } from '../../utils/uploadToBunnyStream.js';

const UPLOADS_DIR = './uploads';

// Ensure the temp uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/** Helper: save stream to a temp file and return the temp path */
const saveTempFile = (createReadStream, uniqueName) =>
  new Promise((resolve, reject) => {
    const tempPath = path.join(UPLOADS_DIR, uniqueName);
    const writeStream = fs.createWriteStream(tempPath);
    createReadStream().pipe(writeStream);
    writeStream.on('finish', () => resolve(tempPath));
    writeStream.on('error', reject);
  });

export const commonResolvers = {
  JSON: GraphQLJSON,
  Upload: GraphQLUpload,

  Mutation: {
    // ─── Images ──────────────────────────────────────────────────────────────
    uploadImage: async (_, { file }) => {
      const { createReadStream, filename } = await file;
      const uniqueName = `images/${Date.now()}-${filename}`;
      const tempPath = await saveTempFile(createReadStream, `${Date.now()}-${filename}`);

      try {
        const imageUrl = await uploadToBunny(tempPath, uniqueName);
        return imageUrl;
      } finally {
        fs.unlink(tempPath, () => {}); // Clean up temp file
      }
    },

    // ─── Videos (Bunny Stream) ───────────────────────────────────────────────
    uploadVideo: async (_, { file }) => {
      const { createReadStream, filename } = await file;
      const tempFileName = `${Date.now()}-${filename}`;
      const tempPath = await saveTempFile(createReadStream, tempFileName);

      try {
        const { videoId, streamUrl } = await uploadToBunnyStream(tempPath, filename);
        // Return the HLS embed URL so it can be saved to DB and used in the player
        return streamUrl;
      } finally {
        fs.unlink(tempPath, () => {}); // Clean up temp file
      }
    },

    // ─── Verification Documents ───────────────────────────────────────────────
    uploadVerificationDocument: async (_, { file, type }) => {
      const { createReadStream, filename } = await file;
      const uniqueName = `verification/${Date.now()}-${type}-${filename}`;
      const tempPath = await saveTempFile(createReadStream, `${Date.now()}-${type}-${filename}`);

      try {
        const url = await uploadToBunny(tempPath, uniqueName);
        return { url, filename: uniqueName };
      } finally {
        fs.unlink(tempPath, () => {}); // Clean up temp file
      }
    },
  },
};
