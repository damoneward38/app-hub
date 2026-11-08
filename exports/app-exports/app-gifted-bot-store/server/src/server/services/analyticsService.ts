import { db } from "../db";
import { contentMasterPurchases } from "../../drizzle/schema";

export async function getPlatformMetrics() {
  const purchases = await db.select().from(contentMasterPurchases);

  const revenue = purchases.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return {
    totalRevenue: revenue,
    totalPurchases: purchases.length,
  };
}
