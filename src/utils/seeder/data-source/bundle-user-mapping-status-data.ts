import { IBundleUserMappingStatus } from "../../../database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export async function generateBundleUserMappingStatusData() {
  const user = await User.findOne({ role: getRoleId("super_admin") });

  if (!user) {
    console.log("No users found. Please add a user first.");
    return [];
  }

  const bundleUserMappingStatusData: Partial<IBundleUserMappingStatus>[] = [
    {
      title: "Pending",
      label: "pending",
      color: "#FFA500",
      is_active: true,
      is_deleted: false,
      is_default: true,
      created_by: user._id,
    },
    {
      title: "Documents Pending",
      label: "documents_pending",
      color: "#FFD700",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Documents Submitted",
      label: "documents_submitted",
      color: "#1E90FF",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Under Review",
      label: "under_review",
      color: "#9370DB",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Approved",
      label: "approved",
      color: "#32CD32",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "In Progress",
      label: "in_progress",
      color: "#00BFFF",
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
      title: "Rejected",
      label: "rejected",
      color: "#FF0000",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Cancelled",
      label: "cancelled",
      color: "#808080",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "On Hold",
      label: "on_hold",
      color: "#A9A9A9",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
  ];

  return bundleUserMappingStatusData;
}
