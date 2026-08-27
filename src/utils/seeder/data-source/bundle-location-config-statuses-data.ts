import { IBundleLocationConfigStatus } from "../../../database/bundle-location-config-status/bundle-location-config-status-db-interface";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export async function generateBundleLocationConfigStatusData() {
  const user = await User.findOne({ role: getRoleId("super_admin") });

  if (!user) {
    console.log("No users found. Please add a user first.");
    return [];
  }

  const bundleLocationConfigStatusData: Partial<IBundleLocationConfigStatus>[] = [
    {
      title: "Waiting for area configuration",
      label: "waiting_for_area_configuration",
      color: "#808080",
      is_active: true,
      is_deleted: false,
      is_default: true,
      created_by: user._id,
    },
    {
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Inactive",
      label: "inactive",
      color: "#FF0000",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Archived",
      label: "archived",
      color: "#A9A9A9",
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
  ];

  return bundleLocationConfigStatusData;
}
