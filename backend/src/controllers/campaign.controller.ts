import type { Response, NextFunction } from "express";
import { Campaign } from "../models/Campaign";
import type { AuthRequest } from "../middleware/auth";
import { createCampaignSchema } from "../utils/campaign.validation";

export async function createCampaign(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createCampaignSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const campaign = await Campaign.create({
      ...input,
      brandId: req.user.id,
    });

    res.status(201).json({ campaign });
  } catch (error) {
    next(error);
  }
}

export async function listLiveCampaigns(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const campaigns = await Campaign.find({ isLive: true })
      .select("name platform totalBudget spentBudget milestones createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ campaigns });
  } catch (error) {
    next(error);
  }
}

export async function listMyCampaigns(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const campaigns = await Campaign.find({
      brandId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ campaigns });
  } catch (error) {
    next(error);
  }
}
