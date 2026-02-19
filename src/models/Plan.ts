import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  slug: string;
  destination: string;
  days: number;
  budget: string;
  travelerType: string;
  status: 'pending' | 'completed' | 'failed';
  heroImage?: {
    url: string;
    photographer: string;
    source: string;
  };
  title?: string;
  summary?: string;
  highlights?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    activities: string[];
  }>;
  rawAiResponse?: Record<string, unknown>;
  aiVersion?: string;
  promptVersion?: string;
  user?: mongoose.Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    slug: { type: String, required: true, unique: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budget: { type: String, required: true },
    travelerType: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    heroImage: {
      url: String,
      photographer: String,
      source: String,
    },
    title: String,
    summary: String,
    highlights: [String],
    itinerary: [
      {
        day: Number,
        title: String,
        activities: [String],
      },
    ],
    rawAiResponse: Schema.Types.Mixed,
    aiVersion: String,
    promptVersion: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

PlanSchema.index(
  { destination: 1, days: 1, budget: 1, travelerType: 1 },
  { unique: true, sparse: true }
);

const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;
