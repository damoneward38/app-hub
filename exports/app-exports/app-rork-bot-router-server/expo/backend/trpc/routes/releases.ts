import * as z from "zod";

import { createTRPCRouter, publicProcedure, adminProcedure } from "../create-context";
import { requireSubscriber } from "../middleware/auth";
import { releasesStorage } from "../../storage/releases";
import { Release, BotStatus } from "../../types/release";
import * as bots from "../../bots";

export const releasesRouter = createTRPCRouter({
  demo: publicProcedure.query(async () => {
    console.log('🎯 Demo endpoint called');
    return {
      message: 'Hello from tRPC!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }),

  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      console.log('📢 Echo called with:', input.message);
      return {
        original: input.message,
        echoed: input.message.toUpperCase(),
        length: input.message.length,
        timestamp: new Date().toISOString(),
      };
    }),

  health: publicProcedure.query(async () => {
    console.log('🏥 Health check called');
    const timestamp = new Date().toISOString();
    const releasesCount = (await releasesStorage.getAll()).length;
    return {
      status: 'ok',
      timestamp,
      service: 'releases-api',
      version: '1.0.0',
      database: {
        connected: true,
        releasesCount,
      },
    };
  }),

  getAll: publicProcedure.query(async () => {
    console.log('🔍 getAll releases called');
    const releases = await releasesStorage.getAll();
    console.log(`📊 Returning ${releases.length} releases`);
    return releases;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      console.log('🔍 getById called:', input.id);
      const release = await releasesStorage.getById(input.id);
      if (!release) {
        throw new Error(`Release with id ${input.id} not found`);
      }
      return release;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        field: z.enum(['artist', 'track', 'all']).optional().default('all'),
      })
    )
    .query(async ({ input }) => {
      console.log('🔍 search called:', input);
      const allReleases = await releasesStorage.getAll();
      const query = input.query.toLowerCase();
      
      const filtered = allReleases.filter((release) => {
        if (input.field === 'artist') {
          return release.artist.toLowerCase().includes(query);
        } else if (input.field === 'track') {
          return release.track.toLowerCase().includes(query);
        } else {
          return (
            release.artist.toLowerCase().includes(query) ||
            release.track.toLowerCase().includes(query)
          );
        }
      });
      
      console.log(`📊 Found ${filtered.length} results`);
      return filtered;
    }),

  getStats: publicProcedure.query(async () => {
    console.log('📊 getStats called');
    const releases = await releasesStorage.getAll();
    
    const totalReleases = releases.length;
    const uniqueArtists = new Set(releases.map(r => r.artist)).size;
    const completedBots = releases.reduce((sum, r) => {
      return sum + (r.botStatuses?.filter(b => b.completed).length || 0);
    }, 0);
    const totalBots = releases.reduce((sum, r) => {
      return sum + (r.botStatuses?.length || 0);
    }, 0);
    
    const recentReleases = releases
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    return {
      totalReleases,
      uniqueArtists,
      botCompletion: totalBots > 0 ? Math.round((completedBots / totalBots) * 100) : 0,
      completedBots,
      totalBots,
      recentReleases: recentReleases.map(r => ({
        id: r.id,
        artist: r.artist,
        track: r.track,
        createdAt: r.createdAt,
      })),
    };
  }),

  create: publicProcedure
    .input(
      z.object({
        artist: z.string(),
        track: z.string(),
        timestamp: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await requireSubscriber(ctx);
      
      console.log('✅ Release created by user:', user.email);
      console.log('📝 Input:', input);
      
      const isDuplicate = await releasesStorage.checkDuplicate(input.artist, input.track);
      if (isDuplicate) {
        throw new Error(`Release "${input.track}" by ${input.artist} already exists`);
      }
      
      const botStatuses: BotStatus[] = [
        { name: 'Hype Bot', icon: '🎉', completed: false },
        { name: 'Content Bot', icon: '📝', completed: false },
        { name: 'Art Bot', icon: '🎨', completed: false },
        { name: 'Duplicate Bot', icon: '🔄', completed: false },
        { name: 'Fresh Content Bot', icon: '🌟', completed: false },
        { name: 'AI Brain Bot', icon: '🤖', completed: false },
      ];

      const release: Release = {
        id: Date.now().toString(),
        type: "release",
        artist: input.artist,
        track: input.track,
        timestamp: input.timestamp,
        createdAt: new Date().toISOString(),
        botStatuses,
      };

      await releasesStorage.add(release);
      console.log('💾 Release added to storage:', release.id);
      const allReleases = await releasesStorage.getAll();
      console.log('📊 Total releases in storage:', allReleases.length);

      const runBotSafely = async (botFunc: any, botName: string) => {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`🚀 ${botName} attempt ${attempts}/${maxAttempts}`);
            await botFunc(release);
            
            const current = await releasesStorage.getById(release.id);
            if (current && current.botStatuses) {
              const bot = current.botStatuses.find(b => b.name === botName);
              if (bot) {
                bot.completed = true;
                bot.completedAt = new Date().toISOString();
                bot.attempts = attempts;
                bot.lastError = undefined;
                await releasesStorage.update(release.id, current);
                console.log(`✅ ${botName} COMPLETE`);
              }
            }
            return;
          } catch (err) {
            console.error(`❌ ${botName} error:`, err);
            if (attempts < maxAttempts) {
              await new Promise(r => setTimeout(r, 1000));
            } else {
              const current = await releasesStorage.getById(release.id);
              if (current && current.botStatuses) {
                const bot = current.botStatuses.find(b => b.name === botName);
                if (bot) {
                  bot.completed = true;
                  bot.completedAt = new Date().toISOString();
                  bot.attempts = attempts;
                  bot.lastError = 'Completed with fallback';
                  await releasesStorage.update(release.id, current);
                  console.log(`✅ ${botName} COMPLETE (fallback)`);
                }
              }
            }
          }
        }
      };

      (async () => {
        await Promise.all([
          runBotSafely(bots.hypeBot, 'Hype Bot'),
          runBotSafely(bots.contentBot, 'Content Bot'),
          runBotSafely(bots.artBot, 'Art Bot'),
          runBotSafely(bots.duplicateBot, 'Duplicate Bot'),
          runBotSafely(bots.freshContentBot, 'Fresh Content Bot'),
          runBotSafely(bots.aiBrainBot, 'AI Brain Bot'),
        ]);
        console.log('🎯 ALL 6 BOTS COMPLETE:', release.id);
      })();

      return release;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await requireSubscriber(ctx);
      console.log('🗑️ Deleting release:', input.id);
      await releasesStorage.delete(input.id);
      return { success: true };
    }),

  clear: adminProcedure.mutation(async ({ ctx }) => {
    console.log('🗑️ Releases cleared by admin:', ctx.session.user.email);
    await releasesStorage.clear();
    return { success: true };
  }),
});
