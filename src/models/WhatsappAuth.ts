import mongoose, { Document, Schema } from 'mongoose';

export interface IWhatsappAuth extends Document {
  agentId: string;
  session: any;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsappAuthSchema = new Schema<IWhatsappAuth>({
  agentId: { type: String, required: true, unique: true },
  session: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model<IWhatsappAuth>('WhatsappAuth', WhatsappAuthSchema); 