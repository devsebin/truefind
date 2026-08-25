import { IServiceStatus } from "../../../database/service-status/service-status-db-interface";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export async function generateServiceStatusData() {
  const user = await User.findOne({ role: getRoleId("super_admin") });

  if (!user) {
    console.log("No users found. Please add a user first.");
    return [];
  }

  const serviceStatusData: Partial<IServiceStatus>[] = [
    {
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_active: true,
      is_deleted: false,
      is_default: true,
      created_by: user._id,
    },
    {
      title: "Inactive",
      label: "inactive",
      color: "#808080",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Pending",
      label: "pending",
      color: "#FFFF00",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Completed",
      label: "completed",
      color: "#008000",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Cancelled",
      label: "cancelled",
      color: "#A9A9A9",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
  ];

  return serviceStatusData;
}
