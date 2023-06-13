import { Document } from 'mongoose';
export interface IUser extends Document {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
}

export interface Payload {
  email: string;
}
