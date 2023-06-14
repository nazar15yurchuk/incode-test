import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const RolesSchema = new mongoose.Schema(
  {
    _user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);
