import mongoose from "mongoose";
import RolesModel from "../../../database/roles/roles-db-model";

export const defaultRoles = [
  {
    _id: new mongoose.Types.ObjectId("64b8a1c8f1e67290bc5b4d1a"),
    title: "Super Admin",
    label: "super_admin",
    color: "#FF0000",
    dimension: "system",
    is_default: false,
    is_active: true,
    is_deleted: false,
  },
  {
    _id: new mongoose.Types.ObjectId("64b8a1c8f1e67290bc5b4d1b"),
    title: "Admin",
    label: "admin",
    color: "#00FF00",
    dimension: "system",
    is_default: false,
    is_active: true,
    is_deleted: false,
  },
  {
    _id: new mongoose.Types.ObjectId("64b8a1c8f1e67290bc5b4d1c"),
    title: "Employee",
    label: "employee",
    color: "#0000FF",
    dimension: "system",
    is_default: false,
    is_active: true,
    is_deleted: false,
  },
  {
    _id: new mongoose.Types.ObjectId("64b8a1c8f1e67290bc5b4d1d"),
    title: "User",
    label: "user",
    color: "#FFFF00",
    dimension: "system",
    is_default: true,
    is_active: true,
    is_deleted: false,
  },
];

export const seedRole = async () => {
  await RolesModel.deleteMany({});

  for (const role of defaultRoles) {
    await RolesModel.create(role);
  }
};

