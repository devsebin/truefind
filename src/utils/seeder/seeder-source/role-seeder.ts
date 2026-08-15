import RolesModel from "../../../database/roles/roles-db-model";

export const seedRole = async () => {
  await RolesModel.deleteMany({});
  
  const defaultRoles = [
    {
      title: "Super Admin",
      label: "super_admin",
      color: "#FF0000",
      dimension: "system",
      is_default: false,
      is_active: true,
      is_deleted: false,
    },
    {
      title: "Admin",
      label: "admin",
      color: "#00FF00",
      dimension: "system",
      is_default: false,
      is_active: true,
      is_deleted: false,
    },
    {
      title: "Employee",
      label: "employee",
      color: "#0000FF",
      dimension: "system",
      is_default: false,
      is_active: true,
      is_deleted: false,
    },
    {
      title: "User",
      label: "user",
      color: "#FFFF00",
      dimension: "system",
      is_default: true,
      is_active: true,
      is_deleted: false,
    },
  ];

  await RolesModel.insertMany(defaultRoles);
};
