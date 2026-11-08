import * as z from "zod";

import { createTRPCRouter, publicProcedure } from "../create-context";
import { requireAuth } from "../middleware/auth";
import { releasesStorage } from "../../storage/releases";

export const adminRouter = createTRPCRouter({
  clearReleases: publicProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      const session = await requireAuth(ctx, true);
      const adminUser = { name: session.user.email };

      releasesStorage.clear();

      return { 
        success: true, 
        message: `All releases cleared by ${adminUser.name}` 
      };
    }),
});
