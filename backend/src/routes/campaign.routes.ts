
import { Router } from "express";
import {
  createCampaign,
  listLiveCampaigns,
  listMyCampaigns,
} from "../controllers/campaign.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", listLiveCampaigns);

router.get(
  "/mine",
  authenticate,
  authorize("brand"),
  listMyCampaigns,
);

router.post(
  "/",
  authenticate,
  authorize("brand"),
  createCampaign,
);

export default router;
