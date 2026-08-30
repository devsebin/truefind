import {
  BaseServiceModel,
  CategoryServiceModel,
  SubcategoryServiceModel,
  ServiceModel,
} from "../../../database/services/services-db-model";
import ServiceStatusModel from "../../../database/service-status/service-status-db-model";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";
import { seedServiceDocuments } from "./service-document-seeder";
import { servicesHierarchyData } from "../data-source/services-data";
import { serviceTypes } from "../../../utils/definitions/constants/service-types";

export const seedServices = async () => {
  const user = await User.findOne({ role: getRoleId("super_admin") });
  const userId = user ? user._id : undefined;

  // Fetch active service status
  const activeStatus = await ServiceStatusModel.findOne({
    label: "active",
    is_deleted: false,
    is_active: true,
  });

  const defaultStatus = await ServiceStatusModel.findOne({
    is_default: true,
    is_deleted: false,
  });

  const statusId = activeStatus ? activeStatus._id : (defaultStatus ? defaultStatus._id : undefined);

  // Clear existing services
  await BaseServiceModel.deleteMany({});

  // Seed icons
  const iconMap = await seedServiceDocuments();

  for (const catConfig of servicesHierarchyData) {
    const subcategoryIds: any[] = [];

    for (const subcatConfig of catConfig.subcategories) {
      const taskServiceIds: any[] = [];

      for (const serviceConfig of subcatConfig.services) {
        const createdService: any = await ServiceModel.create({
          name: serviceConfig.name,
          type: serviceTypes.Service,
          description: serviceConfig.description,
          icon: iconMap[serviceConfig.iconKey] || iconMap["generic_service"],
          estimated_time: serviceConfig.estimated_time,
          estimated_time_unit: serviceConfig.estimated_time_unit,
          status_id: statusId,
          is_active: true,
          is_deleted: false,
          created_by: userId,
        });

        taskServiceIds.push(createdService._id);
      }

      // Create Subcategory
      const createdSubcategory: any = await SubcategoryServiceModel.create({
        name: subcatConfig.name,
        type: serviceTypes.Subcategory,
        description: subcatConfig.description,
        icon: iconMap[subcatConfig.iconKey] || iconMap["generic_service"],
        status_id: statusId,
        children: taskServiceIds,
        is_active: true,
        is_deleted: false,
        created_by: userId,
      });

      subcategoryIds.push(createdSubcategory._id);
    }

    // Create Category
    await CategoryServiceModel.create({
      name: catConfig.name,
      type: serviceTypes.Category,
      description: catConfig.description,
      icon: iconMap[catConfig.iconKey] || iconMap["generic_service"],
      status_id: statusId,
      children: subcategoryIds,
      is_active: true,
      is_deleted: false,
      created_by: userId,
    });
  }
};
