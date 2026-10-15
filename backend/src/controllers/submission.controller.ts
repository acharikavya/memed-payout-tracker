import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth";
import { Campaign } from "../models/Campaign";
import { Submission } from "../models/Submission";
import { updateSubmissionViews } from "../services/submission.service";


const createSubmissionSchema = z.object({
  campaignId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid campaign ID"),
  postUrl: z.string().url().max(2048),
});

const updateViewsSchema = z.object({
  views: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});

function isValidPostUrl(postUrl: string, platform: string): boolean {
  try {
    const hostname = new URL(postUrl).hostname.toLowerCase();

    if (platform === "Instagram") {
      return hostname === "instagram.com" || hostname.endsWith(".instagram.com");
    }

    if (platform === "YouTube") {
      return (
        hostname === "youtube.com" ||
        hostname.endsWith(".youtube.com") ||
        hostname === "youtu.be"
      );
    }

    return false;
  } catch {
    return false;
  }
}

export async function createSubmission(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createSubmissionSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const campaign = await Campaign.findOne({
      _id: input.campaignId,
      isLive: true,
    });

    if (!campaign) {
      res.status(404).json({ message: "Live campaign not found" });
      return;
    }

    if (!isValidPostUrl(input.postUrl, campaign.platform)) {
      res.status(400).json({
        message: `Please provide a valid ${campaign.platform} post URL`,
      });
      return;
    }

    const submission = await Submission.create({
      creatorId: req.user.id,
      campaignId: campaign._id,
      postUrl: input.postUrl,
    });

    res.status(201).json({ submission });
  } catch (error) {
    next(error);
  }
}


export async function updateViews(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = updateViewsSchema.parse(req.body);
    const submissionId = req.params.id;

    if (typeof submissionId !== "string") {
      res.status(400).json({ message: "Invalid submission ID" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    if (submission.creatorId.toString() !== req.user.id) {
      res.status(403).json({
        message: "You can only update your own submissions",
      });
      return;
    }

    const result = await updateSubmissionViews({
      submissionId,
      views: input.views,
    });

    res.status(200).json({
      message: "Views updated successfully",
      payout: result,
    });
  } catch (error) {
    next(error);
  }
}


export async function listMySubmissions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const submissions = await Submission.find({
      creatorId: req.user.id,
    })
      .populate("campaignId", "name platform")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ submissions });
  } catch (error) {
    next(error);
  }
}