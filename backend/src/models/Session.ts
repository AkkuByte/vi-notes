import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

export default mongoose.model<ISession>('Session', SessionSchema);
