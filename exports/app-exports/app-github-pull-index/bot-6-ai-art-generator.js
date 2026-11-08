// ==========================================
// Bot 6 – AI Art Generator (Free / Low-Cost)
// File: server/bots/bot-6-ai-art-generator.js
// ==========================================

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const STABLE_DIFFUSION_API =
  "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image";

const REPLICATE_API =
  "https://api.replicate.com/v1/predictions";

const OUTPUT_DIR = path.join(__dirname, "../generated_images");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generatePromotionalArt(
  title,
  artist,
  style = "gospel"
) {
  console.log(`🤖 Bot 6: Generating art for ${title}`);

  const prompt = `
    Professional album cover art for "${title}" by ${artist}.
    Genre: ${style}.
    Spiritual, uplifting, inspirational.
    High detail, cinematic lighting, bold typography.
    Square format, modern music branding.
  `;

  try {
    const imageBase64 = await generateWithStableDiffusion(prompt);
    return imageBase64;
  } catch (err) {
    console.log("⚠️ Stable Diffusion failed, switching to Replicate");
    return await generateWithReplicate(prompt);
  }
}

async function generateWithStableDiffusion(prompt) {
  const response = await axios.post(
    STABLE_DIFFUSION_API,
    {
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.artifacts[0].base64;
}

async function generateWithReplicate(prompt) {
  const response = await axios.post(
    REPLICATE_API,
    {
      version:
        "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21aef19f932d7ad8d3",
      input: { prompt }
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.output[0];
}

async function generateAlbumCover(albumTitle, artistName) {
  return await generatePromotionalArt(
    albumTitle,
    artistName,
    "album cover"
  );
}

async function generateEventPromo(eventName, eventDate) {
  const prompt = `
    Gospel music event poster.
    Event: ${eventName}
    Date: ${eventDate}
    Powerful, inspirational, professional layout.
    Bold headline text, vibrant lighting.
  `;
  return await generatePromotionalArt(eventName, "Gifted Eternity", "event");
}

function saveImage(base64Data, fileName) {
  const filePath = path.join(
    OUTPUT_DIR,
    `${fileName}.png`
  );
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Image saved: ${filePath}`);
  return filePath;
}

module.exports = {
  generatePromotionalArt,
  generateAlbumCover,
  generateEventPromo,
  saveImage
};
