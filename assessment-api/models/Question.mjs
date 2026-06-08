import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuestionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  tags: { type: [String], default: [] },
  marks: { type: Number, default: 100 },
  timeLimitMs: { type: Number, default: 2000 },
  memoryLimitMb: { type: Number, default: 256 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  visibility: { type: String, enum: ['Private', 'College', 'Public'], default: 'College' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Question', QuestionSchema);
