import mongoose, { Schema } from "mongoose";

interface Token extends Object {
  id: mongoose.Types.ObjectId;
  expiresIn: number;
  jti: string;
}

export default Token;
