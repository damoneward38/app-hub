// =====================================================
// Main Integration – Promotional Bots System (Bots 1–6)
// File: server/promotionalBotsSystem.js
// =====================================================

const bot1 = require("./bots/bot-1-content-manager");
const bot2 = require("./bots/bot-2-distribution");
const bot3 = require("./bots/bot-3-marketing");
const bot4 = require("./bots/bot-4-email-responder");
const bot5 = require("./bots/bot-5-no-repeat-post");
const bot6 = require("./bots/bot-6-ai-art-generator");

class PromotionalBotsSystem {
  constructor() {
    this.bots = {
      1: bot1,
      2: bot2,
      3: bot3,
      4: bot4,
      5: bot5,
      6: bot6
    };
  }

  async runFullCycle() {
    console.log("🚀 STARTING FULL BOT SYSTEM CYCLE");

    // BOT 1 – CONTENT / DATA
    const songs = await this.bots[1].uploadSongs();
    const metadata = await this.bots[1].organizeMetadata(songs);

    // BOT 6 – ART GENERATION
    for (const song of songs) {
      const artBase64 = await this.bots[6].generatePromotionalArt(
        song.title,
        song.artist,
        song.genre || "gospel"
      );
      await this.bots[6].saveImage(
        artBase64,
        `${song.id || song.title}-promo`
      );
    }

    // BOT 2 – DISTRIBUTION
    const distributionResults =
      await this.bots[2].distributeToAllPlatforms(
        songs,
        metadata
      );

    // BOT 5 – DUPLICATE POST CHECK
    const posts = songs.map(song => ({
      content: `New release out now: "${song.title}" by ${song.artist}`,
      platform: "all"
    }));

    const approvedPosts = [];
    for (const post of posts) {
      const ok = await this.bots[5].validatePost(post);
      if (ok) approvedPosts.push(post);
    }

    // BOT 3 – MARKETING / HYPE
    await this.bots[3].createMarketingCampaigns(
      approvedPosts
    );

    // BOT 4 – EMAIL AUTOMATION
    const emails = await this.bots[4].collectEmails();
    await this.bots[4].processEmailQueue(emails);

    return {
      songsProcessed: songs.length,
      postsPublished: approvedPosts.length,
      emailsHandled: emails.length,
      distributions: distributionResults
    };
  }

  async runSingleBot(botNumber, payload = null) {
    if (!this.bots[botNumber]) {
      throw new Error("Bot not found");
    }
    return payload
      ? await this.bots[botNumber].run(payload)
      : await this.bots[botNumber].run();
  }

  status() {
    return {
      bot1: "READY",
      bot2: "READY",
      bot3: "READY",
      bot4: "READY",
      bot5: "READY",
      bot6: "READY"
    };
  }
}

// SYSTEM BOOT
const system = new PromotionalBotsSystem();

system
  .runFullCycle()
  .then(result => {
    console.log("✅ SYSTEM COMPLETE", result);
  })
  .catch(err => {
    console.error("❌ SYSTEM FAILURE", err);
  });

module.exports = PromotionalBotsSystem;
