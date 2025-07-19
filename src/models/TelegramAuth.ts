import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramAuth extends Document {
  agentId: string;
  botToken: string;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramAuthSchema = new Schema<ITelegramAuth>({
  agentId: { type: String, required: true, unique: true },
  botToken: { type: String, required: true },
  webhookUrl: { type: String },
  isActive: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ITelegramAuth>('TelegramAuth', TelegramAuthSchema); 