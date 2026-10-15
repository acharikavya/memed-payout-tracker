import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  createSubmission,
  updateViews,
  listMySubmissions,
} from "../controllers/submission.controller";

const router = Router();

router.get("/mine", authenticate, authorize("creator"), listMySubmissions);
router.post("/", authenticate, authorize("creator"), createSubmission);
router.patch(
  "/:id/views",
  authenticate,
  authorize("creator"),
  updateViews
);

export default router;