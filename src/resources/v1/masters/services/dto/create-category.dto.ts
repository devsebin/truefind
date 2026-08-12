import mongoose from "mongoose";

export interface ICategoryDTO {
  name: string;
  icon: mongoose.Types.ObjectId;
  description: string;
}

export function toCategoryDTO(body: any): ICategoryDTO {
  return {
    name: body.name?.trim(),
    icon: new mongoose.Types.ObjectId(body.icon),
    description: body.description?.trim(),
  };
}
