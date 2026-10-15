import mongoose from "mongoose";
import { Campaign } from "../models/Campaign";
import { Submission } from "../models/Submission";
import {
  calculateTargetPayout,
  allocatePayout,
} from "./payout.service";

interface UpdateViewsInput {
  submissionId: string;
  views: number;
}

export async function updateSubmissionViews({
  submissionId,
  views,
}: UpdateViewsInput) {
  if (!mongoose.isValidObjectId(submissionId)) {
    throw Object.assign(new Error("Invalid submission ID"), {
      statusCode: 400,
    });
  }

  if (!Number.isSafeInteger(views) || views < 0) {
    throw Object.assign(
      new Error("Views must be a non-negative safe integer"),
      { statusCode: 400 }
    );
  }

  const session = await mongoose.startSession();

  let result:
    | {
        submissionId: string;
        views: number;
        targetPayout: number;
        additionalPayout: number;
        totalPaid: number;
        spentBudget: number;
        remainingBudget: number;
      }
    | undefined;

  try {
    await session.withTransaction(async () => {
      const submission = await Submission.findById(submissionId).session(
        session
      );

      if (!submission) {
        throw Object.assign(new Error("Submission not found"), {
          statusCode: 404,
        });
      }

      if (views < submission.views) {
        throw Object.assign(
          new Error("Views cannot be lower than the previously reported count"),
          { statusCode: 400 }
        );
      }

      const campaign = await Campaign.findById(submission.campaignId).session(
        session
      );

      if (!campaign) {
        throw Object.assign(new Error("Campaign not found"), {
          statusCode: 404,
        });
      }

      const targetPayout = calculateTargetPayout(
        views,
        campaign.milestones
      );

      const allocation = allocatePayout(
        targetPayout,
        submission.paidAmount,
        Math.max(0, campaign.totalBudget - campaign.spentBudget)
      );

      const additionalPayout = allocation.additionalPayout;

      if (additionalPayout > 0) {
        const budgetUpdate = await Campaign.updateOne(
          {
            _id: campaign._id,
            $expr: {
              $lte: [
                { $add: ["$spentBudget", additionalPayout] },
                "$totalBudget",
              ],
            },
          },
          { $inc: { spentBudget: additionalPayout } },
          { session }
        );

        if (budgetUpdate.modifiedCount !== 1) {
          throw Object.assign(
            new Error("Campaign budget changed; please retry"),
            { statusCode: 409 }
          );
        }
      }

      submission.views = views;
      submission.paidAmount = allocation.totalPaid;
      await submission.save({ session });

      const updatedSpentBudget = campaign.spentBudget + additionalPayout;

      result = {
        submissionId: submission.id,
        views: submission.views,
        targetPayout,
        additionalPayout,
        totalPaid: submission.paidAmount,
        spentBudget: updatedSpentBudget,
        remainingBudget: campaign.totalBudget - updatedSpentBudget,
      };
    });

    if (!result) {
      throw new Error("Unable to update submission");
    }

    return result;
  } finally {
    await session.endSession();
  }
}