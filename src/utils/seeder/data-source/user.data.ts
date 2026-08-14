import mongoose from "mongoose";
import { IInputUserPayload } from "../../../resources/v1/users/payloads/user-input.interface";
import { roleTypes } from "../../../utils/definitions/constants/role-types";
import bcrypt from "bcrypt";

export async function generateUserData(): Promise<IInputUserPayload[]> {
  const userData: IInputUserPayload[] = [
    {
      first_name: "Sebin",
      last_name: "George",
      role: roleTypes.SuperAdmin,
      email: "sebin@example.com",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      password: await bcrypt.hash("Se12b3123@#$%", 10),
      priority_id: new mongoose.Types.ObjectId(),
      phone: "0211234567",
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
      country_id: null,
      region_id: null,
      district_id: null,
      suburb_id: null,
      referral_code: "abc123x",
      is_active: true,
      is_deleted: false,
      login_attempts: 1,
      is_account_locked: false,
      verification_attempts: 0,
      status_id: new mongoose.Types.ObjectId(), // Replace with actual default status ID after seeding statuses
    },
  ];

  return userData;
}
