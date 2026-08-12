import mongoose from "mongoose";

export interface ISubCategoryDTO {
  parent_id: mongoose.Types.ObjectId;
  name: string;
  icon: mongoose.Types.ObjectId;
  description: string;
}

export function toSubCategoryDTO(body: any): ISubCategoryDTO {
  return {
    parent_id: new mongoose.Types.ObjectId(body.parent_id),
    name: body.name?.trim(),
    icon: new mongoose.Types.ObjectId(body.icon),
    description: body.description?.trim(),
  };
}
