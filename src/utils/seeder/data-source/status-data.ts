import { IStatus } from "../../..//database/status/status-db-interface";
import User from "../../../database/users/users-db-model";
import { roleTypes } from "../../../utils/definitions/constants/role-types";

export async function generateStatusData() {
  const user = await User.findOne({ role: roleTypes.SuperAdmin }); // Or adjust to your specific query to get the first user

  if (!user) {
    console.log("No users found. Please add a user first.");
    return;
  }
  const statusData: IStatus[] = [
    {
      title: "Active",
      label: "active",
      color: "#00FF00", // Green
      is_active: true,
      is_deleted: false,
      is_default: true,
      created_by: user._id,
    },
    {
      title: "Inactive",
      label: "inactive",
      color: "#808080", // Gray
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Suspended",
      label: "suspended",
      color: "#FFA500", // Orange
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Deleted",
      label: "deleted",
      color: "#FF0000", // Red
      is_active: true,
      is_deleted: false,
      deleted_at: new Date(),
      created_by: user._id,
    },
    {
      title: "Pending",
      label: "pending",
      color: "#FFFF00", // Yellow
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Archived",
      label: "archived",
      color: "#800080", // Purple
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Draft",
      label: "draft",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Completed",
      label: "completed",
      color: "#008000", // Green
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Cancelled",
      label: "cancelled",
      color: "#A9A9A9", // Dark Gray
      is_active: false,
      is_deleted: true,
      deleted_at: new Date(),
      created_by: user._id,
    },
    {
      title: "Failed",
      label: "failed",
      color: "#FF0000", // Red
      is_active: true,
      is_deleted: false,
      deleted_at: new Date(),
      created_by: user._id,
    },
    {
      title: "In Progress",
      label: "in_progress",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "On Hold",
      label: "on_hold",
      color: "#FFFF00", // Yellow
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Under Review",
      label: "under_review",
      color: "#FFA500", // Orange
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Approved",
      label: "approved",
      color: "#00FF00", // Green
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Rejected",
      label: "rejected",
      color: "#FF0000", // Red
      is_active: true,
      is_deleted: false,
      deleted_at: new Date(),
      created_by: user._id,
    },
    {
      title: "Escalated",
      label: "escalated",
      color: "#800080", // Purple
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Resolved",
      label: "resolved",
      color: "#00FF00", // Green
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Approval",
      label: "waiting_for_approval",
      color: "#FFFF00", // Yellow
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Payment",
      label: "waiting_for_payment",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Confirmation",
      label: "waiting_for_confirmation",
      color: "#FFFF00", // Yellow
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Response",
      label: "waiting_for_response",
      color: "#800080", // Purple
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Information",
      label: "waiting_for_information",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Action",
      label: "waiting_for_action",
      color: "#FFA500", // Orange
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Review",
      label: "waiting_for_review",
      color: "#800080", // Purple
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Feedback",
      label: "waiting_for_feedback",
      color: "#FFFF00", // Yellow
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Approval from Manager",
      label: "waiting_for_approval_from_manager",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Approval from Client",
      label: "waiting_for_approval_from_client",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Approval from Vendor",
      label: "waiting_for_approval_from_vendor",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Approval from Admin",
      label: "waiting_for_approval_from_admin",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Waiting for Approval from Team Lead",
      label: "waiting_for_approval_from_team_lead",
      color: "#0000FF", // Blue
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Parent deleted",
      label: "parent_deleted",
      color: "#FF0000", // Red
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
    {
      title: "Child deleted",
      label: "child_deleted",
      color: "#FF0000", // Red
      is_active: true,
      is_deleted: false,
      is_default: false,
      created_by: user._id,
    },
  ];

  return statusData;
}
