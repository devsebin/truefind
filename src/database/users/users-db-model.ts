import mongoose, { Schema, Types, Document, model } from "mongoose";
import { priorities } from "../../utils/definitions/constants/priorities";
import { tableName } from "../../utils/definitions/constants/table-names";
import {
  IUser,
  IUserBasicFormDto,
  IUserDeclaimerInput,
} from "./users-db-interface";
import { defaultPriorityPlugin } from "../../utils/plugins/defaultPriority.plugin";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";

// Define the IconUrl schema
const IconUrlSchema: Schema = new Schema(
  {
    imageUrl: { type: String, required: true },
    thumbnailUrls: { type: [String], required: true },
  },
  { _id: false },
);

// Define the Icon schema
const IconSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: IconUrlSchema, required: true },
  },
  { _id: false },
);

const PrioritySchema = new Schema(
  {
    title: { type: String, required: true, default: priorities.High },
    priority: { type: Number, required: true, default: 1 },
  },
  { _id: false },
);

const DeclaimerSchema = new Schema<IUserDeclaimerInput>(
  {
    declaimer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Declaimers,
      required: true,
    },
    accepted: { type: Boolean, required: true, default: false },
  },
  {
    _id: false,
    timestamps: true,
  },
);

export const inputUserBasicSchema = new Schema<IUserBasicFormDto>(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    business_name: {
      type: String,
      required: true,
      trim: true,
    },

    year_of_experience: {
      type: Number,
      required: true,
      min: 0,
    },

    street_address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    zip: {
      type: String,
      required: true,
      trim: true,
    },

    gst_number: {
      type: String,
      trim: true,
      default: null,
    },

    ird_number: {
      type: String,
      required: true,
      trim: true,
    },

    declaimer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);
// Define the IUser schema
const UserSchema: Schema = new Schema<IUser>(
  {
    first_name: { type: String, required: false, default: null },
    middle_name: { type: String, default: null },
    last_name: { type: String, required: false, default: null },
    role: {
      type: Schema.Types.ObjectId,
      ref: tableName.Roles,
      required: true,
      index: true,
      set: function(v: any) {
        if (typeof v === "string") {
          const mapping: Record<string, string> = {
            super_admin: "64b8a1c8f1e67290bc5b4d1a",
            admin: "64b8a1c8f1e67290bc5b4d1b",
            employee: "64b8a1c8f1e67290bc5b4d1c",
            user: "64b8a1c8f1e67290bc5b4d1d",
          };
          if (mapping[v]) {
            return new Types.ObjectId(mapping[v]);
          }
        }
        return v;
      },
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    password: { type: String, default: null },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date, default: null },
    priority_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Priority,
      default: null,
      required: false,
    },
    icon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Documents,
      default: null,
      required: false,
    },
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Countries,
      default: null,
      required: false,
    },
    region_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Regions,
      default: null,
      required: false,
    },
    district_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Districts,
      default: null,
      required: false,
    },
    suburb_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Suburbs,
      default: null,
      required: false,
    },
    referral_code: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    last_login: { type: Date, default: null },
    login_attempts: { type: Number, default: 0 },
    last_login_attempt: { type: Date, default: null },
    is_account_locked: { type: Boolean, default: false },
    account_locked_until: { type: Date, default: null },
    google_token: { type: String, default: null },
    google_id: { type: String, default: null },
    verification_attempts: { type: Number, default: 0 },
    declaimer: {
      type: [DeclaimerSchema],
      default: [],
    },
    user_basic: { type: inputUserBasicSchema, default: null },
    status_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Status,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  },
);

UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" }, // only index when it's a real string
    },
  },
);

UserSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: "string" },
    },
  },
);
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.plugin(defaultPriorityPlugin);
UserSchema.plugin(defaultStatusPlugin);

UserSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  this.where({ is_active: true, is_deleted: false });
});
UserSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  if (!this.getOptions().includeDeleted) {
    this.where({ is_active: true, is_deleted: false });
  }
});

// Create and export the model
const UserModel = mongoose.model<IUser>(tableName.User, UserSchema);

export default UserModel;
