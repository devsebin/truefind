import mongoose, { Document, Types } from "mongoose";

export interface IUserDeclaimerInput {
  declaimer_id: Types.ObjectId; // allow string from API, cast later
  accepted: boolean;
}

export interface IUserBasicFormDto {
  first_name: string;
  last_name: string;
  business_name: string;
  year_of_experience: number;
  street_address: string;
  city: string;
  zip: string;
  gst_number?: string;
  ird_number: string;
  declaimer: string;
}

export interface IUserPriority {
  title: string;
  priority: number;
}

export interface IUser extends Document {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  role: Types.ObjectId;
  email?: string;
  password?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
  priority_id: Types.ObjectId;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  icon?: Types.ObjectId;
  country_id?: Types.ObjectId | null;
  region_id?: Types.ObjectId | null;
  district_id?: Types.ObjectId | null;
  suburb_id?: Types.ObjectId | null;
  referral_code?: string;
  is_active: boolean;
  is_deleted: boolean;
  last_login?: Date;
  login_attempts?: number;
  last_login_attempt?: Date;
  is_account_locked?: boolean;
  account_locked_until?: Date;
  google_token?: string;
  google_id?: string;
  declaimer?: IUserDeclaimerInput[];
  user_basic?: IUserBasicFormDto;
  verification_attempts?: number;
  status_id: Types.ObjectId;
}

export interface IInputUser {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  role: Types.ObjectId;
  email?: string | null;
  password?: string | null;
  emailVerified?: boolean;
  emailVerifiedAt?: Date;
  priority: IUserPriority;
  phone?: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  icon?: mongoose.Types.ObjectId;
  user_location?: string;
  user_country?: string;
  user_region?: string;
  user_city?: string;
  referral_code?: string;
  is_active: boolean;
  is_deleted: boolean;
  last_login?: Date;
  login_attempts?: number;
  last_login_attempt?: Date;
  is_account_locked?: boolean;
  account_locked_until?: Date;
  google_token?: string;
  google_id?: string;
  declaimer?: IUserDeclaimerInput[];
  verification_attempts?: number;
  user_basic?: IUserBasicFormDto;
  status: boolean;
}
