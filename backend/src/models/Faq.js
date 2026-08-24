import mongoose from "mongoose";

const { Schema, model } = mongoose;

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "General",
      index: true,
    },
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

faqSchema.index({ status: 1, category: 1, displayOrder: 1 });

export default model("Faq", faqSchema);
