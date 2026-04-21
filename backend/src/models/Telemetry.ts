import mongoose, { Schema, Document } from 'mongoose';

export interface ITelemetryEvent {
  timestamp: number;
  actionType: string;
  timeDelta: number;
}

export interface ITelemetry extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: string;
  events: ITelemetryEvent[];
}

const TelemetryEventSchema: Schema = new Schema({
  timestamp: { type: Number, required: true },
  actionType: { type: String, required: true },
  timeDelta: { type: Number, required: true },
}, { _id: false });

const TelemetrySchema: Schema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
  userId: { type: String, required: true, index: true },
  events: [TelemetryEventSchema],
}, {
  timestamps: true 
});

export default mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
