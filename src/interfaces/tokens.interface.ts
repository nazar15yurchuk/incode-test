import { Document } from 'mongoose';
export interface IToken extends Document {
  access_token: string;
  refresh_token: string;
}
