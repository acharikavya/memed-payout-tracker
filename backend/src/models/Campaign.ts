
import { Schema, model } from "mongoose";

const milestoneSchema = new Schema(
  {
    views: {
      type: Number,
      required: true,
      min: 1,
    },
    payout: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const campaignSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    platform: {
      type: String,
      enum: ["Instagram", "YouTube"],
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 1,
    },
    spentBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    milestones: {
      type: [milestoneSchema],
      required: true,
      validate: {
        validator: (milestones: { views: number; payout: number }[]) => {
          if (milestones.length === 0) return false;

          for (let i = 0; i < milestones.length; i++) {
            const current = milestones[i];

            if (
              !Number.isSafeInteger(current.views) ||
              !Number.isSafeInteger(current.payout) ||
              current.views < 1 ||
              current.payout < 0
            ) {
              return false;
            }

            if (i > 0) {
              const previous = milestones[i - 1];

              if (
                current.views <= previous.views ||
                current.payout < previous.payout
              ) {
                return false;
              }
            }
          }

          return true;
        },
        message:
          "Milestones must have increasing view thresholds and non-decreasing payouts",
      },
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

campaignSchema.index({ isLive: 1, createdAt: -1 });

export const Campaign = model("Campaign", campaignSchema);
