import { router, publicProcedure, protectedProcedure } from "../\_core/trpc";
import { z } from "zod";
import GiftedEternityContentMaster from "../bots/contentMaster";
import { logger } from "../\_core/logger";
import { TRPCError } from "@trpc/server";
import { paymentService } from "../contentMaster/paymentService";
import { adminDashboardService } from "../contentMaster/adminDashboardService";
import { bulkImportService } from "../contentMaster/bulkImportService";

// Initialize Content Master instance
const contentMaster = new GiftedEternityContentMaster();

// Validation schemas
const knowledgeEntryInput = z.object({
  type: z.enum(["website", "book", "music", "artist", "feature", "blog"]),
  title: z.string().min(1),
  content: z.string().min(1),
  url: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const contentMasterRouter = router({
  /**
   * PAYMENT PROCEDURES - Stripe/PayPal integration for $29/month and $299 lifetime plans
   */
  payment: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({ planId: z.enum(["monthly", "lifetime"]) }))
      .mutation(async ({ input, ctx }) => {
        try {
          const session = await paymentService.createCheckoutSession(
            ctx.user.id.toString(),
            input.planId
          );
          return session;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to create checkout session",
          });
        }
      }),

    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      try {
        const subscription = await paymentService.getUserSubscription(
          ctx.user.id.toString()
        );
        return subscription;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch subscription",
        });
      }
    }),

    hasActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
      try {
        const hasActive = await paymentService.hasActiveSubscription(
          ctx.user.id.toString()
        );
        return { hasActive };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check subscription status",
        });
      }
    }),

    cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const subscription = await paymentService.cancelSubscription(
          ctx.user.id.toString()
        );
        return subscription;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to cancel subscription",
        });
      }
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      try {
        const stats = await paymentService.getSubscriptionStats();
        return stats;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch subscription stats",
        });
      }
    }),
  }),

  /**
   * DASHBOARD PROCEDURES
   */
  dashboard: router({
    getMetrics: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const metrics = await adminDashboardService.getDashboardMetrics(input.days);
          return metrics;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch dashboard metrics",
          });
        }
      }),

    exportJSON: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const data = await adminDashboardService.exportDashboardData(input.days);
          return { data };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to export dashboard data",
          });
        }
      }),

    exportCSV: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(365).default(30) }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        try {
          const csv = await adminDashboardService.exportDashboardCSV(input.days);
          return { csv };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to export dashboard CSV",
          });
        }
      }),
  }),

  /**
   * BULK IMPORT PROCEDURES
   */
  import: router({
    fromCSV: protectedProcedure
      .input(z.object({ csvContent: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await bulkImportService.importFromCSV(
            ctx.user.id,
            input.csvContent
          );
          return result;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "CSV import failed",
          });
        }
      }),

    fromJSON: protectedProcedure
      .input(z.object({ jsonContent: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await bulkImportService.importFromJSON(
            ctx.user.id,
            input.jsonContent
          );
          return result;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "JSON import failed",
          });
        }
      }),

    getCSVTemplate: publicProcedure.query(async () => {
      return { template: bulkImportService.generateCSVTemplate() };
    }),

    getJSONTemplate: publicProcedure.query(async () => {
      return { template: bulkImportService.generateJSONTemplate() };
    }),

    exportAsCSV: protectedProcedure.query(async ({ ctx }) => {
      try {
        const csv = await bulkImportService.exportAsCSV(ctx.user.id);
        return { csv };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export knowledge base",
        });
      }
    }),

    exportAsJSON: protectedProcedure.query(async ({ ctx }) => {
      try {
        const json = await bulkImportService.exportAsJSON(ctx.user.id);
        return { json };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export knowledge base",
        });
      }
    }),
  }),

  /**
   * ORIGINAL CONTENT MASTER PROCEDURES
   */
  /**
   * ORIGINAL CONTENT MASTER PROCEDURES (continued)
   */
  /**
   * Get Content Master status
   */
  getStatus: publicProcedure.query(async () => {
    try {
      const status = await contentMaster.getStatus();
      return status;
    } catch (error) {
      logger.error("Error getting Content Master status:", error);
      throw error;
    }
  }),

  /**
   * Add knowledge entry
   */
  addKnowledge: protectedProcedure.input(knowledgeEntryInput).mutation(async ({ input }) => {
    try {
      const entry = await contentMaster.addKnowledge({
        type: input.type,
        title: input.title,
        content: input.content,
        url: input.url,
        metadata: input.metadata || {},
      });
      return entry;
    } catch (error) {
      logger.error("Error adding knowledge entry:", error);
      throw error;
    }
  }),

  /**
   * Update knowledge entry
   */
  updateKnowledge: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        url: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const entry = await contentMaster.updateKnowledge(input.id, {
          title: input.title,
          content: input.content,
          url: input.url,
          metadata: input.metadata || {},
        } as any);
        return entry;
      } catch (error) {
        logger.error("Error updating knowledge entry:", error);
        throw error;
      }
    }),

  /**
   * Get knowledge entry by ID
   */
  getKnowledge: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const entry = await contentMaster.getKnowledge(input.id);
      return entry;
    } catch (error) {
      logger.error("Error getting knowledge entry:", error);
      throw error;
    }
  }),

  /**
   * Search knowledge by type
   */
  searchKnowledge: publicProcedure.input(z.object({ type: z.string() })).query(async ({ input }) => {
    try {
      const entries = await contentMaster.searchKnowledge(input.type);
      return entries;
    } catch (error) {
      logger.error("Error searching knowledge:", error);
      throw error;
    }
  }),

  /**
   * Get all knowledge entries
   */
  getAllKnowledge: publicProcedure.query(async () => {
    try {
      const entries = await contentMaster.getAllKnowledge();
      return entries;
    } catch (error) {
      logger.error("Error getting all knowledge entries:", error);
      throw error;
    }
  }),

  /**
   * Get knowledge base statistics
   */
  getKnowledgeStats: publicProcedure.query(async () => {
    try {
      const stats = await contentMaster.getKnowledgeStats();
      return stats;
    } catch (error) {
      logger.error("Error getting knowledge stats:", error);
      throw error;
    }
  }),

  /**
   * Generate blog post from knowledge base
   */
  generateBlogPost: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        relatedTypes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const relatedTypes = input.relatedTypes || ["website", "book", "music", "artist", "feature"];
        const blogPost = await contentMaster.generateBlogPost(input.topic, relatedTypes);
        return blogPost;
      } catch (error) {
        logger.error("Error generating blog post:", error);
        throw error;
      }
    }),

  /**
   * Get blog post by ID
   */
  getBlogPost: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const blogPost = await contentMaster.getBlogPost(input.id);
      return blogPost;
    } catch (error) {
      logger.error("Error getting blog post:", error);
      throw error;
    }
  }),

  /**
   * Get all blog posts
   */
  getAllBlogPosts: publicProcedure.query(async () => {
    try {
      const blogPosts = await contentMaster.getAllBlogPosts();
      return blogPosts;
    } catch (error) {
      logger.error("Error getting all blog posts:", error);
      throw error;
    }
  }),

  /**
   * Get featured blog posts
   */
  getFeaturedBlogPosts: publicProcedure.query(async () => {
    try {
      const blogPosts = await contentMaster.getFeaturedBlogPosts();
      return blogPosts;
    } catch (error) {
      logger.error("Error getting featured blog posts:", error);
      throw error;
    }
  }),

  /**
   * Feature/unfeature blog post
   */
  setFeatured: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        featured: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const blogPost = await contentMaster.setFeatured(input.id, input.featured);
        return blogPost;
      } catch (error) {
        logger.error("Error setting featured status:", error);
        throw error;
      }
    }),

  /**
   * Run all six bots in orchestration mode
   */
  runAllBots: protectedProcedure.mutation(async () => {
    try {
      const results = await contentMaster.runAllBots();
      logger.info("All six bots executed successfully");
      return results;
    } catch (error) {
      logger.error("Error running all bots:", error);
      throw error;
    }
  }),

  /**
   * Point to relevant content based on query
   */
  pointToContent: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
    try {
      const content = await contentMaster.pointToContent(input.query);
      return content;
    } catch (error) {
      logger.error("Error pointing to content:", error);
      throw error;
    }
  }),

  /**
   * Export knowledge base
   */
  exportKnowledgeBase: protectedProcedure.query(async () => {
    try {
      const entries = await contentMaster.exportKnowledgeBase();
      return entries;
    } catch (error) {
      logger.error("Error exporting knowledge base:", error);
      throw error;
    }
  }),

  /**
   * Import knowledge entries
   */
  importKnowledgeBase: protectedProcedure
    .input(
      z.object({
        entries: z.array(knowledgeEntryInput),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const entries = input.entries.map((e) => ({
          ...e,
          metadata: e.metadata || {},
        }));
        const count = await contentMaster.importKnowledgeBase(entries);
        logger.info(`Imported ${count} knowledge entries`);
        return { imported: count };
      } catch (error) {
        logger.error("Error importing knowledge base:", error);
        throw error;
      }
    }),

  /**
   * KNOWLEDGE BASE PROCEDURES
   */
  knowledge: router({
    add: protectedProcedure
      .input(
        z.object({
          type: z.enum(["website", "book", "music", "artist", "feature", "blog"]),
          title: z.string(),
          content: z.string(),
          url: z.string().optional(),
          metadata: z.any().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { knowledgeBaseService } = await import(
            "../contentMaster/knowledgeBaseService"
          );
          return await knowledgeBaseService.addEntry(ctx.user!.id, input);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to add knowledge entry",
          });
        }
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        const { knowledgeBaseService } = await import(
          "../contentMaster/knowledgeBaseService"
        );
        return await knowledgeBaseService.getEntries(ctx.user!.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch knowledge entries",
        });
      }
    }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input, ctx }) => {
        try {
          const { knowledgeBaseService } = await import(
            "../contentMaster/knowledgeBaseService"
          );
          return await knowledgeBaseService.searchEntries(ctx.user!.id, input.query);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search knowledge entries",
          });
        }
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      try {
        const { knowledgeBaseService } = await import(
          "../contentMaster/knowledgeBaseService"
        );
        return await knowledgeBaseService.getStatistics(ctx.user!.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch knowledge statistics",
        });
      }
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { knowledgeBaseService } = await import(
            "../contentMaster/knowledgeBaseService"
          );
          return await knowledgeBaseService.deleteEntry(ctx.user!.id, input.id);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete knowledge entry",
          });
        }
      }),
  }),

  /**
   * BLOG PROCEDURES
   */
  blog: router({
    generate: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          topic: z.string().optional(),
          style: z.enum(["technical", "narrative", "marketing"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { blogGenerationService } = await import(
            "../contentMaster/blogGenerationService"
          );
          return await blogGenerationService.generateBlogPost(ctx.user!.id, input);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to generate blog post",
          });
        }
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        const { blogGenerationService } = await import(
          "../contentMaster/blogGenerationService"
        );
        return await blogGenerationService.getBlogPosts(ctx.user!.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog posts",
        });
      }
    }),

    publish: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { blogGenerationService } = await import(
            "../contentMaster/blogGenerationService"
          );
          return await blogGenerationService.publishBlogPost(ctx.user!.id, input.postId);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to publish blog post",
          });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { blogGenerationService } = await import(
            "../contentMaster/blogGenerationService"
          );
          return await blogGenerationService.deleteBlogPost(ctx.user!.id, input.postId);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete blog post",
          });
        }
      }),
  }),
});

export default contentMasterRouter;

