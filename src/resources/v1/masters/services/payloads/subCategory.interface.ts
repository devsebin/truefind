import { Types } from "mongoose";

export interface ISubCategoryFormDto {
  name: string;
  icon: string;
  description: string;
}

export interface ISubCategoryPayload {
  parent_id: Types.ObjectId;
  name: string;
  icon: string;
  description: string;
}
