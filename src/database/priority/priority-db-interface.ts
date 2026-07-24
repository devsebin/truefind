import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document } from "mongoose";

/**
 * Plain interface for the schema fields
 */
export interface IPriorities extends CommonServiceFieldsInterface {
  title: string;
  label: string;
  color: string;
  description?: string;
  is_default?: boolean;
}

/**
 * Extended document interface to use with the model
 */
export interface IPrioritiesDocument extends IPriorities, Document {}
