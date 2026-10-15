
import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(100),
  platform: z.enum(["Instagram", "YouTube"]),
  totalBudget: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  milestones: z
    .array(
      z.object({
        views: z.number().int().positive(),
        payout: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .max(50)
    .superRefine((milestones, ctx) => {
      for (let i = 1; i < milestones.length; i++) {
        if (milestones[i].views <= milestones[i - 1].views) {
          ctx.addIssue({
            code: "custom",
            path: [i, "views"],
            message: "View thresholds must be strictly increasing",
          });
        }

        if (milestones[i].payout < milestones[i - 1].payout) {
          ctx.addIssue({
            code: "custom",
            path: [i, "payout"],
            message: "Payouts must be non-decreasing",
          });
        }
      }
    }),
});
