(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // shims/fs-shim.js
  var require_fs_shim = __commonJS({
    "shims/fs-shim.js"(exports, module) {
      init_inject();
      var store = globalThis.__virtualFS__ = globalThis.__virtualFS__ || {
        files: /* @__PURE__ */ new Map()
      };
      function mkdirSync() {
        return true;
      }
      function existsSync(p) {
        return store.files.has(p) || p.endsWith("/generated_images") && store.files.size > 0;
      }
      function writeFileSync(p, data) {
        const name = String(p).split("/").pop();
        store.files.set(name, typeof data === "string" ? data : String(data));
        return true;
      }
      module.exports = { mkdirSync, existsSync, writeFileSync, readdirSync: () => [...store.files.keys()] };
    }
  });

  // shims/path-shim.js
  var require_path_shim = __commonJS({
    "shims/path-shim.js"(exports, module) {
      init_inject();
      var fs2 = require_fs_shim();
      var path2 = require_path_shim();
      module.exports = {
        join: (...parts) => parts.join("/").replace(/\/+/g, "/").replace(/^\/+/, ""),
        basename: (p) => String(p).split("/").pop() || p,
        dirname: (p) => String(p).split("/").slice(0, -1).join("/"),
        extname: (p) => {
          const b = String(p).split("/").pop();
          const i = b.lastIndexOf(".");
          return i > 0 ? b.slice(i) : "";
        }
      };
    }
  });

  // shims/axios-shim.js
  var require_axios_shim = __commonJS({
    "shims/axios-shim.js"(exports, module) {
      init_inject();
      function drawCover(prompt) {
        const title = String(prompt || "Gifted Eternity").replace(/\s+/g, " ").slice(0, 60);
        const canvas = document.createElement("canvas");
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        const g = ctx.createLinearGradient(0, 0, 480, 480);
        g.addColorStop(0, "#1b2a6b");
        g.addColorStop(0.45, "#4a1d6e");
        g.addColorStop(0.75, "#8a2be2");
        g.addColorStop(1, "#f5a623");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 480, 480);
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 480, Math.random() * 480, Math.random() * 3, 0, 7);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 30px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("\u266A GIFTED ETERNITY \u266A", 240, 215);
        ctx.font = "19px system-ui";
        const lines = title.split(/[.,\n]/)[0];
        ctx.fillText(lines.slice(0, 34), 240, 260);
        return canvas.toDataURL("image/png").replace(/^data:.*?base64,/, "");
      }
      function post(url, body, opts) {
        const prompt = (body && body.text_prompts && body.text_prompts[0] && body.text_prompts[0].text || "").trim();
        return Promise.resolve({
          data: { artifacts: [{ base64: drawCover(prompt) }] },
          ok: true
        });
      }
      module.exports = { post, get: post };
    }
  });

  // shims/nodemailer-shim.js
  var require_nodemailer_shim = __commonJS({
    "shims/nodemailer-shim.js"(exports, module) {
      init_inject();
      function createTransport(cfg) {
        const mailbox = globalThis.__mailbox__ = globalThis.__mailbox__ || [];
        return {
          sendMail: async (opts) => {
            mailbox.push({
              to: opts.to,
              subject: opts.subject,
              html: opts.html,
              sentAt: (/* @__PURE__ */ new Date()).toLocaleTimeString()
            });
            return { messageId: "q1<" + Date.now() + "@demo>" };
          }
        };
      }
      module.exports = { createTransport };
    }
  });

  // shims/openai-shim.js
  var require_openai_shim = __commonJS({
    "shims/openai-shim.js"(exports, module) {
      init_inject();
      var Configuration2 = (cfg) => ({ apiKey: cfg && cfg.apiKey || "demo" });
      var OPENAI_ORDER = [
        "Thank you for reaching out. I would love to explore this collaboration.",
        "We are delighted to hear from you \u2014 let's set up a call this week.",
        "Appreciate your interest in our music. We'll circle back shortly.",
        "Sounds like a great opportunity. Our team will follow up within 24h."
      ];
      var OpenAIApi2 = class {
        constructor() {
          this._n = 0;
        }
        async createChatCompletion({ messages }) {
          const user = [...messages].reverse().find((m) => m.role === "user");
          const body = user && user.content || "";
          const reply = `Dear partner,

${OPENAI_ORDER[this._n++ % OPENAI_ORDER.length]}

Re your message: "${String(body).slice(0, 80)}"

Warm regards,
Gifted Eternity Records`;
          return { data: { choices: [{ message: { content: reply } }] } };
        }
      };
      module.exports = { OpenAIApi: OpenAIApi2, Configuration: Configuration2 };
    }
  });

  // shims/inject.js
  var fs, path, axios, nodemailer, OpenAIApi, Configuration, process;
  var init_inject = __esm({
    "shims/inject.js"() {
      fs = require_fs_shim();
      path = require_path_shim();
      axios = require_axios_shim();
      nodemailer = require_nodemailer_shim();
      ({ OpenAIApi, Configuration } = require_openai_shim());
      globalThis.Buffer = globalThis.Buffer || {
        from: (b) => b
      };
      process = { env: {} };
    }
  });

  // bot-1-content-manager.js
  var require_bot_1_content_manager = __commonJS({
    "bot-1-content-manager.js"(exports, module) {
      init_inject();
      async function uploadSongs() {
        console.log("\u{1F916} Bot 1: Uploading songs...");
        return [
          {
            id: "song-001",
            title: "Amazing Grace",
            artist: "Gospel Artist",
            genre: "gospel",
            duration: 240,
            uploadDate: /* @__PURE__ */ new Date()
          },
          {
            id: "song-002",
            title: "Hallelujah",
            artist: "Gospel Artist",
            genre: "gospel",
            duration: 200,
            uploadDate: /* @__PURE__ */ new Date()
          }
        ];
      }
      async function organizeMetadata(songs) {
        console.log("\u{1F916} Bot 1: Organizing metadata...");
        return songs.map((song) => ({
          ...song,
          tags: ["gospel", "inspirational"],
          category: "new-releases",
          featured: true
        }));
      }
      module.exports = {
        uploadSongs,
        organizeMetadata
      };
    }
  });

  // bot-2-distribution.js
  var require_bot_2_distribution = __commonJS({
    "bot-2-distribution.js"(exports, module) {
      init_inject();
      var platforms = [
        "spotify",
        "apple-music",
        "youtube",
        "soundcloud",
        "bandcamp"
      ];
      async function distributeToAllPlatforms(songs, metadata) {
        console.log("\u{1F916} Bot 2: Distributing to all platforms...");
        const results = [];
        for (const song of songs) {
          for (const platform of platforms) {
            console.log(`  \u2192 Uploading "${song.title}" to ${platform}...`);
            results.push({
              songId: song.id,
              platform,
              status: "distributed",
              timestamp: /* @__PURE__ */ new Date(),
              url: `https://${platform}.com/track/${song.id}`
            });
          }
        }
        console.log(`\u2705 Distributed ${results.length} songs across platforms`);
        return results;
      }
      module.exports = {
        distributeToAllPlatforms
      };
    }
  });

  // bot-3-marketing.js
  var require_bot_3_marketing = __commonJS({
    "bot-3-marketing.js"(exports, module) {
      init_inject();
      async function createMarketingCampaigns(posts) {
        console.log("\u{1F916} Bot 3: Creating marketing campaigns...");
        const campaigns = [];
        for (const post of posts) {
          campaigns.push({
            postContent: post.content,
            channels: ["instagram", "twitter", "facebook", "tiktok"],
            schedule: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            status: "scheduled"
          });
          console.log(`  \u2192 Campaign created for: "${post.content.substring(0, 50)}..."`);
        }
        console.log(`\u2705 Created ${campaigns.length} marketing campaigns`);
        return campaigns;
      }
      module.exports = {
        createMarketingCampaigns
      };
    }
  });

  // bot-4-email-responder.js
  var require_bot_4_email_responder = __commonJS({
    "bot-4-email-responder.js"(exports, module) {
      init_inject();
      var nodemailer2 = require_nodemailer_shim();
      var { OpenAIApi: OpenAIApi2, Configuration: Configuration2 } = require_openai_shim();
      var openai = new OpenAIApi2(
        new Configuration2({
          apiKey: "demo"
        })
      );
      var emailTransporter = nodemailer2.createTransport({
        service: "gmail",
        auth: {
          user: "demo",
          pass: process.env.GMAIL_PASSWORD
        }
      });
      async function getIncomingEmails() {
        return [
          {
            from: "example@sender.com",
            subject: "Business Inquiry",
            body: "I would like to discuss a collaboration opportunity."
          }
        ];
      }
      async function collectEmails() {
        console.log("\u{1F916} Bot 4: Collecting emails...");
        return await getIncomingEmails();
      }
      async function generateEmailResponse(email) {
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional music business email assistant."
            },
            {
              role: "user",
              content: `Reply professionally to this email:

${email.body}`
            }
          ],
          max_tokens: 500
        });
        return response.data.choices[0].message.content;
      }
      async function sendEmailResponse(email, response) {
        await emailTransporter.sendMail({
          from: "demo",
          to: email.from,
          subject: `Re: ${email.subject}`,
          html: `<p>${response}</p>`
        });
        console.log(`\u2705 Email sent to ${email.from}`);
      }
      async function processEmailQueue(emails) {
        for (const email of emails) {
          const response = await generateEmailResponse(email);
          await sendEmailResponse(email, response);
        }
      }
      async function runEmailBot() {
        const emails = await collectEmails();
        await processEmailQueue(emails);
      }
      module.exports = {
        collectEmails,
        processEmailQueue,
        runEmailBot
      };
    }
  });

  // bot-5-no-repeat-post.js
  var require_bot_5_no_repeat_post = __commonJS({
    "bot-5-no-repeat-post.js"(exports, module) {
      init_inject();
      var postHistory = [];
      function addToHistory(post) {
        postHistory.push({
          content: post.content,
          timestamp: /* @__PURE__ */ new Date(),
          platform: post.platform
        });
      }
      function checkForDuplicates(newPost) {
        console.log("\u{1F916} Bot 5: Checking for duplicate posts...");
        for (const oldPost of postHistory) {
          const similarity = calculateSimilarity(
            newPost.content,
            oldPost.content
          );
          if (similarity > 0.85) {
            console.log(
              `\u26A0\uFE0F Similar post found! Similarity: ${(similarity * 100).toFixed(2)}%`
            );
            return { isDuplicate: true, similarity, oldPost };
          }
        }
        console.log("\u2705 No duplicates found - safe to post");
        return { isDuplicate: false };
      }
      function calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) return 1;
        const editDistance = getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
      }
      function getEditDistance(s1, s2) {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
          let lastValue = i;
          for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
              costs[j] = j;
            } else if (j > 0) {
              let newValue = costs[j - 1];
              if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
              }
              costs[j - 1] = lastValue;
              lastValue = newValue;
            }
          }
          if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
      }
      async function validatePost(post) {
        const check = checkForDuplicates(post);
        if (check.isDuplicate) {
          console.log(
            `\u274C Post rejected - too similar to post from ${check.oldPost.timestamp}`
          );
          return false;
        }
        addToHistory(post);
        console.log("\u2705 Post approved - added to history");
        return true;
      }
      module.exports = {
        validatePost,
        checkForDuplicates,
        addToHistory
      };
    }
  });

  // bot-6-ai-art-generator.js
  var require_bot_6_ai_art_generator = __commonJS({
    "bot-6-ai-art-generator.js"(exports, module) {
      init_inject();
      var axios2 = require_axios_shim();
      var fs2 = require_fs_shim();
      var path2 = require_path_shim();
      var STABLE_DIFFUSION_API = "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image";
      var REPLICATE_API = "https://api.replicate.com/v1/predictions";
      var OUTPUT_DIR = path2.join("/", "../generated_images");
      if (!fs2.existsSync(OUTPUT_DIR)) {
        fs2.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      async function generatePromotionalArt(title, artist, style = "gospel") {
        console.log(`\u{1F916} Bot 6: Generating art for ${title}`);
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
          console.log("\u26A0\uFE0F Stable Diffusion failed, switching to Replicate");
          return await generateWithReplicate(prompt);
        }
      }
      async function generateWithStableDiffusion(prompt) {
        const response = await axios2.post(
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
              Authorization: `Bearer ${"demo"}`,
              "Content-Type": "application/json"
            }
          }
        );
        return response.data.artifacts[0].base64;
      }
      async function generateWithReplicate(prompt) {
        const response = await axios2.post(
          REPLICATE_API,
          {
            version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21aef19f932d7ad8d3",
            input: { prompt }
          },
          {
            headers: {
              Authorization: `Token ${"demo"}`,
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
        const filePath = path2.join(
          OUTPUT_DIR,
          `${fileName}.png`
        );
        const buffer = Buffer.from(base64Data, "base64");
        fs2.writeFileSync(filePath, buffer);
        console.log(`\u2705 Image saved: ${filePath}`);
        return filePath;
      }
      module.exports = {
        generatePromotionalArt,
        generateAlbumCover,
        generateEventPromo,
        saveImage
      };
    }
  });

  // src/entry.js
  init_inject();
  var bot1 = require_bot_1_content_manager();
  var bot2 = require_bot_2_distribution();
  var bot3 = require_bot_3_marketing();
  var bot4 = require_bot_4_email_responder();
  var bot5 = require_bot_5_no_repeat_post();
  var bot6 = require_bot_6_ai_art_generator();
  var GiftedEternityBots = class {
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
      step("Running full bot system cycle\u2026");
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
        } catch (e) {
        }
        art.push({ title: song.title, base64 });
      }
      step(`Bot 6 ok: ${art.length} covers generated`);
      const distribution = await bot2.distributeToAllPlatforms(songs, metadata);
      step(`Bot 2 ok: ${distribution.length} platform uploads (${[...new Set(distribution.map((d) => d.platform))].join(", ")})`);
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
  };
  globalThis.GE_BOTS = new GiftedEternityBots();
  globalThis.__GE__ = { fs: globalThis.__virtualFS__ || { files: /* @__PURE__ */ new Map() } };
})();
