// utils/uploadToBunny.js
// Handles image, document, and other file uploads to Bunny Storage.
// Returns a fast CDN (Pull Zone) URL instead of the direct storage URL.

import axios from "axios";
import fs from "fs/promises";

export const uploadToBunny = async (filePath, fileName) => {
  const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
  const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_HOST;
  const BUNNY_PULL_ZONE_URL = process.env.BUNNY_PULL_ZONE_URL;

  if (!BUNNY_API_KEY || !BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_HOST) {
    throw new Error("Missing Bunny Storage environment variables.");
  }

  const uploadUrl = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${fileName}`;
  // Non-blocking async read — doesn't freeze the event loop during upload
  const fileBuffer = await fs.readFile(filePath);

  const response = await axios.put(uploadUrl, fileBuffer, {
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/octet-stream",
    },
  });

  if (response.status !== 201) {
    throw new Error(
      `Bunny Storage upload failed with status ${response.status}`,
    );
  }

  // Return the fast CDN URL, not the storage origin URL
  const baseUrl = BUNNY_PULL_ZONE_URL
    ? BUNNY_PULL_ZONE_URL.replace(/\/$/, "")
    : `https://${BUNNY_STORAGE_ZONE}.b-cdn.net`;

  return `${baseUrl}/${fileName}`;
};
