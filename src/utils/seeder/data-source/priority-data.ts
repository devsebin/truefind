import { IStatus } from "../../../database/priorities/priorities-db-interface";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export async function generatePriorityData(): Promise<Partial<IStatus>[]> {
  const user = await User.findOne({ role: getRoleId("super_admin") });

  const userId = user ? user._id : undefined;

  return [
    {
      title: "Lowest",
      label: "lowest",
      color: "#808080",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Very Low",
      label: "very_low",
      color: "#6c757d",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Low",
      label: "low",
      color: "#28a745",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Medium",
      label: "medium",
      color: "#17a2b8",
      is_default: true,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Normal",
      label: "normal",
      color: "#007bff",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "High",
      label: "high",
      color: "#fd7e14",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Very High",
      label: "very_high",
      color: "#ff6347",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Urgent",
      label: "urgent",
      color: "#dc3545",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Critical",
      label: "critical",
      color: "#b22222",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Emergency",
      label: "emergency",
      color: "#8b0000",
      is_default: false,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
  ];
}
