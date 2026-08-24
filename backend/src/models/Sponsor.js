import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sponsorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    tier: { type: String, trim: true, maxlength: 80, default: "Partner" },
    logoUrl: { type: String, required: true, trim: true },
    websiteUrl: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    displayOrder: { type: Number, min: 0, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

sponsorSchema.index({ status: 1, displayOrder: 1, name: 1 });

export default model("Sponsor", sponsorSchema);
