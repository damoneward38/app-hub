/**
 * Knowledge Base Router
 * Handles file uploads and knowledge base management for bot training
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { knowledgeEntries } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const knowledgeBaseRouter = router({
  /**
   * Upload a file to the knowledge base
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        botId: z.number(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileContent: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not initialized",
          });
        }

        // Validate file size (max 10MB)
        if (input.fileSize > 10 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size exceeds 10MB limit",
          });
        }

        // Extract text content from file
        let textContent = input.fileContent;
        if (input.fileType === "application/pdf") {
          // In production, use a PDF parsing library
          textContent = `[PDF: ${input.fileName}]\n${input.fileContent}`;
        }

        // Insert knowledge entry
        const metadata = {
          botId: input.botId,
          fileType: input.fileType,
          fileSize: input.fileSize,
          uploadedAt: new Date().toISOString(),
        };

        const result = await db.insert(knowledgeEntries).values({
          userId: ctx.user.id,
          type: "document",
          title: input.fileName,
          content: textContent,
          metadata: JSON.stringify(metadata),
        });

        return {
          id: `${Date.now()}-${Math.random()}`,
          fileName: input.fileName,
          status: "completed",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to upload file",
        });
      }
    }),

  /**
   * Process a file for bot training
   */
  processFile: protectedProcedure
    .input(
      z.object({
        botId: z.number(),
        fileId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // In production, this would trigger an async job to process the file
        // and extract embeddings for vector search

        return {
          success: true,
          message: "File processing started",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to process file",
        });
      }
    }),

  /**
   * Get knowledge base statistics for a bot
   */
  getKnowledgeBase: protectedProcedure
    .input(
      z.object({
        botId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not initialized",
          });
        }

        // Get all knowledge entries for this user
        const entries = await db
          .select()
          .from(knowledgeEntries)
          .where(eq(knowledgeEntries.userId, ctx.user.id));

        // Filter entries related to this bot
        const botEntries = entries.filter(
          (entry) =>
            entry.metadata &&
            typeof entry.metadata === "object" &&
            (entry.metadata as any).botId === input.botId
        );

        // Calculate statistics
        const totalDocuments = botEntries.length;
        const totalEntries = botEntries.length;
        const storageUsed = botEntries.reduce((sum, entry) => {
          const metadata = entry.metadata as any;
          return sum + (metadata?.fileSize || 0);
        }, 0);

        const lastUpdated =
          botEntries.length > 0
            ? botEntries[botEntries.length - 1].createdAt
            : null;

        return {
          totalDocuments,
          totalEntries,
          storageUsed,
          lastUpdated,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch knowledge base",
        });
      }
    }),

  /**
   * Delete a knowledge base entry
   */
  deleteEntry: protectedProcedure
    .input(
      z.object({
        entryId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not initialized",
          });
        }

        // Delete entry (verify ownership)
        await db
          .delete(knowledgeEntries)
          .where(
            and(
              eq(knowledgeEntries.id, input.entryId),
              eq(knowledgeEntries.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete entry",
        });
      }
    }),

  /**
   * List all knowledge base entries for a bot
   */
  listEntries: protectedProcedure
    .input(
      z.object({
        botId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not initialized",
          });
        }

        const entries = await db
          .select()
          .from(knowledgeEntries)
          .where(eq(knowledgeEntries.userId, ctx.user.id));

        // Filter entries related to this bot
        const botEntries = entries.filter(
          (entry) =>
            entry.metadata &&
            typeof entry.metadata === "object" &&
            (entry.metadata as any).botId === input.botId
        );

        return botEntries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          type: entry.type,
          createdAt: entry.createdAt,
          metadata: entry.metadata,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to list entries",
        });
      }
    }),
});
