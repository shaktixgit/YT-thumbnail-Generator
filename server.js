import "dotenv/config.js";
import express from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Modality } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const model = "gemini-3-pro-image-preview";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed."));
      return;
    }

    callback(null, true);
  }
});

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.use(express.static(path.join(__dirname, "public")));

app.post(
  "/api/generate",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "portrait", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: "Missing GEMINI_API_KEY. Add it to your .env file and restart the server."
        });
      }

      const thumbnail = req.files?.thumbnail?.[0];
      const portrait = req.files?.portrait?.[0];
      const instructions = String(req.body.instructions || "").trim();

      if (!thumbnail || !portrait) {
        return res.status(400).json({
          error: "Please upload both a thumbnail image and a portrait/head image."
        });
      }

      const prompt = buildPrompt(instructions);
      console.log("Generating thumbnail face swap", {
        model,
        hasExtraInstructions: Boolean(instructions),
        thumbnailType: thumbnail.mimetype,
        portraitType: portrait.mimetype
      });

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: thumbnail.mimetype,
                  data: thumbnail.buffer.toString("base64")
                }
              },
              {
                inlineData: {
                  mimeType: portrait.mimetype,
                  data: portrait.buffer.toString("base64")
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT]
        }
      });

      const imagePart = findGeneratedImage(response);

      if (!imagePart) {
        console.error("Gemini did not return image data", response?.candidates?.[0]?.content?.parts);
        return res.status(502).json({
          error: "Gemini did not return an image. Try different images or clearer instructions."
        });
      }

      const mimeType = imagePart.inlineData.mimeType || "image/png";
      const dataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

      res.json({ image: dataUrl, mimeType });
    } catch (error) {
      console.error("Image generation failed:", error);
      res.status(500).json({
        error: error.message || "Image generation failed."
      });
    }
  }
);

app.use((error, _req, res, _next) => {
  res.status(400).json({
    error: error.message || "Upload failed."
  });
});

app.listen(port, () => {
  console.log(`YT Thumbnail Face Swap Generator running at http://localhost:${port}`);
});

function buildPrompt(extraInstructions) {
  const basePrompt =
    "Use the first uploaded image as the base YouTube thumbnail. Use the second uploaded image as the portrait/head source. Replace or blend the visible face/head in the thumbnail with the portrait head while preserving the original thumbnail layout, background, colors, text, and overall composition. Make the result realistic, clean, high quality, and suitable for a YouTube thumbnail. Keep the thumbnail readable and do not add new text unless the user explicitly asks for it.";

  if (!extraInstructions) {
    return basePrompt;
  }

  return `${basePrompt}\n\nExtra user instructions: ${extraInstructions}`;
}

function findGeneratedImage(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts.find((part) => part.inlineData?.data);
}
