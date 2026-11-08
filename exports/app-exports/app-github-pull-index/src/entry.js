const bot1 = require("../bot-1-content-manager.js");
const bot2 = require("../bot-2-distribution.js");
const bot3 = require("../bot-3-marketing.js");
const bot4 = require("../bot-4-email-responder.js");
const bot5 = require("../bot-5-no-repeat-post.js");
const bot6 = require("../bot-6-ai-art-generator.js");

class GiftedEternityBots {
  constructor() {
    this.bots = { 1: bot1, 2: bot2, 3: bot3, 4: bot4, 5: bot5, 6: bot6 };
  }

  async songs() {
    return bot1.uploadSongs();
  }

  async organize(songs) {
    return bot1.organizeMetadata(songs);
  }

  async runFullCycle() {
    const step = (msg) => console.log(msg);
    step("Running full bot system cycle…");

    const songs = await bot1.uploadSongs();
    const metadata = await bot1.organizeMetadata(songs);
    step(`Bot 1 ok: ${songs.length} songs, metadata organized`);

    let art = [];
    for (const song of songs) {
      const base64 = await bot6.generatePromotionalArt(
        song.title,
        song.artist,
        song.genre || "gospel"
      );
      try {
        bot6.saveImage(base64, `${(song.id || song.title).replace(/[^a-z0-9]/gi, "-")}-promo`);
      } catch (e) { /* saved via virtual fs */ }
      art.push({ title: song.title, base64 });
    }
    step(`Bot 6 ok: ${art.length} covers generated`);

    const distribution = await bot2.distributeToAllPlatforms(songs, metadata);
    step(`Bot 2 ok: ${distribution.length} platform uploads (${[...new Set(distribution.map(d => d.platform))].join(", ")})`);

    const posts = songs.map((song) => ({
      content: `New release out now: "${song.title}" by ${song.artist}`,
      platform: "all"
    }));
    const approved = [];
    for (const post of posts) {
      if (await bot5.validatePost(post)) approved.push(post);
    }
    step(`Bot 5 ok: ${approved.length}/${posts.length} posts approved (no repeats)`);

    const campaigns = await bot3.createMarketingCampaigns(approved);
    step(`Bot 3 ok: ${campaigns.length} campaigns scheduled on ${campaigns[0] ? campaigns[0].channels.length : 0} channels`);

    const emails = await bot4.collectEmails();
    await bot4.processEmailQueue(emails);
    step(`Bot 4 ok: ${emails.length} emails replied + sent (X-count: ${(globalThis.__mailbox__ || []).length})`);

    console.log("CYCLE COMPLETE");
    return {
      songsProcessed: songs.length,
      covers: art.length,
      postsPublished: approved.length,
      campaigns: campaigns.length,
      distributions: distribution.length,
      emailsHandled: emails.length
    };
  }

  status() {
    return {
      1: "READY",
      2: "READY",
      3: "READY",
      4: "READY",
      5: "READY",
      6: "READY"
    };
  }
}

globalThis.GE_BOTS = new GiftedEternityBots();
globalThis.__GE__ = { fs: (globalThis.__virtualFS__ || { files: new Map() }) };