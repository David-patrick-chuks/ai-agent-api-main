import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
  userId: string;
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  avatar?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  refreshTokens: string[];
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true, default: uuidv4 },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  name: { type: String },
  avatar: { type: String },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  refreshTokens: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema); 