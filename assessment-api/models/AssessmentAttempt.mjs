import mongoose from "mongoose";
const { Schema } = mongoose;

const AssessmentAttemptSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Submitted", "TimedOut"],
      default: "Active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("AssessmentAttempt", AssessmentAttemptSchema);
