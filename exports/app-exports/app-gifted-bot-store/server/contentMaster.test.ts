import { describe, it, expect, beforeEach } from "vitest";
import GiftedEternityContentMaster from "./bots/contentMaster";

describe("Gifted Eternity Content Master", () => {
  let contentMaster: GiftedEternityContentMaster;

  beforeEach(() => {
    contentMaster = new GiftedEternityContentMaster();
  });

  describe("Knowledge Base Management", () => {
    it("should add a knowledge entry", async () => {
      const entry = await contentMaster.addKnowledge({
        type: "website",
        title: "My Music Website",
        content: "A website showcasing my music and artist profile",
        url: "https://example.com",
        metadata: { category: "music" },
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.title).toBe("My Music Website");
      expect(entry.type).toBe("website");
    });

    it("should retrieve a knowledge entry by ID", async () => {
      const added = await contentMaster.addKnowledge({
        type: "book",
        title: "My Autobiography",
        content: "The story of my life and career",
        metadata: {},
      });

      const retrieved = await contentMaster.getKnowledge(added.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("My Autobiography");
    });

    it("should search knowledge by type", async () => {
      await contentMaster.addKnowledge({
        type: "music",
        title: "Album 1",
        content: "First album",
        metadata: {},
      });

      await contentMaster.addKnowledge({
        type: "music",
        title: "Album 2",
        content: "Second album",
        metadata: {},
      });

      const musicEntries = await contentMaster.searchKnowledge("music");
      expect(musicEntries.length).toBeGreaterThanOrEqual(2);
      expect(musicEntries.every((e) => e.type === "music")).toBe(true);
    });

    it("should get all knowledge entries", async () => {
      await contentMaster.addKnowledge({
        type: "artist",
        title: "Artist 1",
        content: "First artist",
        metadata: {},
      });

      const all = await contentMaster.getAllKnowledge();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
    });

    it("should update a knowledge entry", async () => {
      const added = await contentMaster.addKnowledge({
        type: "feature",
        title: "Original Title",
        content: "Original content",
        metadata: {},
      });

      const updated = await contentMaster.updateKnowledge(added.id, {
        title: "Updated Title",
      });

      expect(updated?.title).toBe("Updated Title");
    });
  });

  describe("Blog Post Generation", () => {
    beforeEach(async () => {
      // Add some knowledge entries for blog generation
      await contentMaster.addKnowledge({
        type: "website",
        title: "My Portfolio",
        content: "Showcasing my work",
        metadata: {},
      });

      await contentMaster.addKnowledge({
        type: "music",
        title: "Latest Album",
        content: "My newest music release",
        metadata: {},
      });
    });

    it("should generate a blog post", async () => {
      const blogPost = await contentMaster.generateBlogPost("My Journey", ["website", "music"]);

      expect(blogPost).toBeDefined();
      expect(blogPost.id).toBeDefined();
      expect(blogPost.title).toContain("My Journey");
      expect(blogPost.topic).toBe("My Journey");
    });

    it("should retrieve a blog post by ID", async () => {
      const generated = await contentMaster.generateBlogPost("Test Blog", ["website"]);
      const retrieved = await contentMaster.getBlogPost(generated.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(generated.id);
    });

    it("should get all blog posts", async () => {
      await contentMaster.generateBlogPost("Blog 1", ["website"]);
      await contentMaster.generateBlogPost("Blog 2", ["music"]);

      const all = await contentMaster.getAllBlogPosts();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThanOrEqual(2);
    });

    it("should feature/unfeature blog posts", async () => {
      const post = await contentMaster.generateBlogPost("Featured Post", ["website"]);

      const featured = await contentMaster.setFeatured(post.id, true);
      expect(featured?.featured).toBe(true);

      const unfeatured = await contentMaster.setFeatured(post.id, false);
      expect(unfeatured?.featured).toBe(false);
    });

    it("should get featured blog posts", async () => {
      const post1 = await contentMaster.generateBlogPost("Featured 1", ["website"]);
      const post2 = await contentMaster.generateBlogPost("Featured 2", ["music"]);

      await contentMaster.setFeatured(post1.id, true);
      await contentMaster.setFeatured(post2.id, true);

      const featured = await contentMaster.getFeaturedBlogPosts();
      expect(featured.length).toBeGreaterThanOrEqual(2);
      expect(featured.every((p) => p.featured)).toBe(true);
    });
  });

  describe("Six Bots Orchestration", () => {
    it("should run all six bots successfully", async () => {
      const results = await contentMaster.runAllBots();

      expect(results).toBeDefined();
      expect(results.brain).toBeDefined();
      expect(results.creative).toBeDefined();
      expect(results.hype).toBeDefined();
      expect(results.sync).toBeDefined();
      expect(results.validator).toBeDefined();
      expect(results.monitor).toBeDefined();
    });
  });

  describe("Content Pointer", () => {
    beforeEach(async () => {
      await contentMaster.addKnowledge({
        type: "website",
        title: "Main Website",
        content: "My main portfolio website",
        metadata: {},
      });

      await contentMaster.addKnowledge({
        type: "book",
        title: "My Book",
        content: "My published book",
        metadata: {},
      });

      await contentMaster.addKnowledge({
        type: "music",
        title: "My Album",
        content: "My latest album release",
        metadata: {},
      });
    });

    it("should point to relevant content", async () => {
      const results = await contentMaster.pointToContent("website");

      expect(results).toBeDefined();
      expect(results.websites).toBeDefined();
      expect(Array.isArray(results.websites)).toBe(true);
    });

    it("should search across all content types", async () => {
      const results = await contentMaster.pointToContent("my");

      expect(results.websites.length).toBeGreaterThan(0);
      expect(results.books.length).toBeGreaterThan(0);
      expect(results.music.length).toBeGreaterThan(0);
    });
  });

  describe("Knowledge Base Statistics", () => {
    beforeEach(async () => {
      await contentMaster.addKnowledge({
        type: "website",
        title: "Site 1",
        content: "Content",
        metadata: {},
      });

      await contentMaster.addKnowledge({
        type: "book",
        title: "Book 1",
        content: "Content",
        metadata: {},
      });

      await contentMaster.addKnowledge({
        type: "music",
        title: "Track 1",
        content: "Content",
        metadata: {},
      });
    });

    it("should get knowledge base statistics", async () => {
      const stats = await contentMaster.getKnowledgeStats();

      expect(stats).toBeDefined();
      expect(stats.totalEntries).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
      expect(stats.totalBlogPosts).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Import/Export", () => {
    it("should export knowledge base", async () => {
      await contentMaster.addKnowledge({
        type: "website",
        title: "Export Test",
        content: "Testing export",
        metadata: {},
      });

      const exported = await contentMaster.exportKnowledgeBase();
      expect(Array.isArray(exported)).toBe(true);
      expect(exported.length).toBeGreaterThan(0);
    });

    it("should import knowledge entries", async () => {
      const entries = [
        {
          type: "website" as const,
          title: "Imported Website",
          content: "Imported content",
          metadata: {},
        },
        {
          type: "book" as const,
          title: "Imported Book",
          content: "Imported content",
          metadata: {},
        },
      ];

      const count = await contentMaster.importKnowledgeBase(entries);
      expect(count).toBe(2);
    });
  });

  describe("Status and Health", () => {
    it("should return operational status", async () => {
      const status = await contentMaster.getStatus();

      expect(status).toBeDefined();
      expect(status.name).toBe("Gifted Eternity Content Master");
      expect(status.status).toBe("operational");
      expect(status.botsStatus).toBeDefined();
      expect(Object.keys(status.botsStatus).length).toBe(6);
    });
  });
});
