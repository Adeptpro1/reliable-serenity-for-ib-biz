// utils/uploadToBunnyStream.js
// Handles video uploads to Bunny Stream.
// Process:
//   1. Create a video entry in the library → gets a Video ID
//   2. Upload the file buffer to that Video ID
//   3. Return the full HLS stream URL for playback and the Video ID for reference

import axios from "axios";
import fs from "fs";

export const uploadToBunnyStream = async (filePath, title) => {
  const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;
  const API_KEY = process.env.BUNNY_STREAM_API_KEY;

  if (!LIBRARY_ID || !API_KEY) {
    throw new Error("Missing Bunny Stream environment variables.");
  }

  const baseApiUrl = `https://video.bunnycdn.com/library/${LIBRARY_ID}`;

  // Step 1: Create a video entry in the library to get a Video ID
  const createRes = await axios.post(
    `${baseApiUrl}/videos`,
    { title: title || "debisi-video" },
    {
      headers: {
        AccessKey: API_KEY,
        "Content-Type": "application/json",
      },
    },
  );

  const videoId = createRes.data?.guid;
  if (!videoId) {
    throw new Error("Bunny Stream did not return a Video ID on creation.");
  }

  // Step 2: Upload the video file to the created entry
  const fileBuffer = fs.readFileSync(filePath);

  await axios.put(`${baseApiUrl}/videos/${videoId}`, fileBuffer, {
    headers: {
      AccessKey: API_KEY,
      "Content-Type": "application/octet-stream",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  // Step 3: Return the full HLS streaming URL (recommended for playback)
  // Bunny Stream's embed URL allows adaptive bitrate playback
  const streamUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;

  return {
    videoId,
    streamUrl, // Use this URL in your frontend <iframe> player
  };
};
