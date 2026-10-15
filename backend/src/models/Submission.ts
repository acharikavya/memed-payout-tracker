import { Schema, model, type InferSchemaType } from "mongoose";

const submissionSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    postUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value),
        message: "Views must be a non-negative safe integer",
      },
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: (value: number) => Number.isSafeInteger(value),
        message: "Paid amount must be a non-negative safe integer",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

submissionSchema.index({ campaignId: 1, creatorId: 1 });

export type SubmissionDocument = InferSchemaType<typeof submissionSchema>;
export const Submission = model("Submission", submissionSchema);