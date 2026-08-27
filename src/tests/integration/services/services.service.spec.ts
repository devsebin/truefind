import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import createCategoryService from "@/resources/v1/masters/services/services/create-category.service";
import createSubcategoryService from "@/resources/v1/masters/services/services/create-subcategory.service";
import createServiceService from "@/resources/v1/masters/services/services/create-service.service";
import showServiceEntityService from "@/resources/v1/masters/services/services/show-service-entity.service";
import deleteServiceEntityService from "@/resources/v1/masters/services/services/delete-service-entity.service";
import enableServiceEntityService from "@/resources/v1/masters/services/services/enable-service-entity.service";
import disableServiceEntityService from "@/resources/v1/masters/services/services/disable-service-entity.service";
import updateServiceEntityService from "@/resources/v1/masters/services/services/update-service-entity.service";
import listCategoryService from "@/resources/v1/masters/services/services/list-category.service";
import { BaseServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { serviceTypes } from "@/utils/definitions/constants/service-types";

describe("Services Master Service (Integration)", () => {
  let testUser: any;
  let testIcon: any;
  let activeStatus: any;
  let parentDisabledStatus: any;
  let parentDeletedStatus: any;

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed statuses
    activeStatus = await StatusModel.create({
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    parentDisabledStatus = await StatusModel.create({
      title: "Parent disabled",
      label: "parent_disabled",
      color: "#FF0000",
      is_default: false,
      is_active: true,
      is_deleted: false,
    });

    parentDeletedStatus = await StatusModel.create({
      title: "Parent deleted",
      label: "parent_deleted",
      color: "#FF0000",
      is_default: false,
      is_active: true,
      is_deleted: false,
    });

    const defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    // Seed test user
    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: activeStatus._id,
      priority_id: defaultPriority._id,
    });

    // Seed icon document
    testIcon = await DocumentModel.create({
      name: "test-icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "test-key" },
      status_id: activeStatus._id,
    });
  });

  it("should successfully execute cascading creation, show, enable, disable, and delete", async () => {
    // 1. Create Category
    const categoryPayload = {
      name: "Cleaning Services",
      description: "All cleaning tasks",
      icon: testIcon._id.toString(),
    };

    let categoryResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      categoryResult = await createCategoryService.execute(
        { body: categoryPayload } as any,
        categoryPayload
      );
    });

    expect(categoryResult.result.code).toBe(201);
    const categoryId = categoryResult.result.data[0].result.id;
    expect(categoryId).toBeDefined();

    // 2. Create Subcategory under Category
    const subcategoryPayload = {
      parent_id: categoryId,
      name: "House Cleaning",
      description: "Residential house cleaning",
      icon: testIcon._id.toString(),
    };

    let subcategoryResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      subcategoryResult = await createSubcategoryService.execute(
        { body: subcategoryPayload } as any,
        subcategoryPayload
      );
    });

    expect(subcategoryResult.result.code).toBe(201);
    const subcategoryId = subcategoryResult.result.data[0].result.id;
    expect(subcategoryId).toBeDefined();

    // 3. Create Service under Subcategory
    const servicePayload = {
      parent_id: subcategoryId,
      name: "Deep Bathroom Scrubbing",
      description: "Scrubbing floor and walls",
      icon: testIcon._id.toString(),
      estimated_time: 2,
      estimated_time_unit: "hours",
    };

    let serviceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      serviceResult = await createServiceService.execute(
        { body: servicePayload } as any,
        servicePayload
      );
    });

    expect(serviceResult.result.code).toBe(201);
    const serviceId = serviceResult.result.data[0].result.id;
    expect(serviceId).toBeDefined();

    // 3.5. List categories with show_inactive_services: true
    let listResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      listResult = await listCategoryService.execute({
        user: { role: "admin" },
        query: {
          show_inactive_categories: true,
          show_inactive_subcategories: true,
          show_inactive_services: true,
          remove_empty_categories: false,
          remove_empty_sub_category: false,
        },
      } as any);
    });

    expect(listResult.result.code).toBe(200);
    const categories = listResult.result.data[0].result;
    const listedCategory = categories.find((c: any) => c._id && c._id.toString() === categoryId.toString());
    expect(listedCategory).toBeDefined();
    const listedSubcategory = listedCategory.children.find((s: any) => s._id.toString() === subcategoryId.toString());
    expect(listedSubcategory).toBeDefined();
    const listedService = listedSubcategory.children.find((serv: any) => serv._id.toString() === serviceId.toString());
    expect(listedService).toBeDefined();

    // 4. Show Category and populate children recursively
    let showResult: any;
    showResult = await showServiceEntityService.execute(new mongoose.Types.ObjectId(categoryId));
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.child_count).toBe(1);
    expect(showResult.result.data[0].result.children[0].id.toString()).toBe(subcategoryId.toString());

    // 4.5 Update Category
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateServiceEntityService.execute(
        new mongoose.Types.ObjectId(categoryId),
        testUser._id,
        { name: "Super Cleaning Services", description: "Updated description" }
      );
    });
    expect(updateResult.result.code).toBe(200);

    const updatedCategory = await BaseServiceModel.findById(categoryId);
    expect(updatedCategory!.name).toBe("Super Cleaning Services");
    expect(updatedCategory!.description).toBe("Updated description");

    // 5. Disable Category (cascades down)
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableServiceEntityService.execute(
        new mongoose.Types.ObjectId(categoryId),
        testUser._id
      );
    });
    expect(disableResult.result.code).toBe(200);

    // Verify subcategory and service are deactivated and status is parent_disabled
    const dbSubcategoryDisabled = await BaseServiceModel.findById(subcategoryId);
    expect(dbSubcategoryDisabled!.is_active).toBe(false);
    expect(dbSubcategoryDisabled!.status_id.toString()).toBe(parentDisabledStatus._id.toString());

    const dbServiceDisabled = await BaseServiceModel.findById(serviceId);
    expect(dbServiceDisabled!.is_active).toBe(false);
    expect(dbServiceDisabled!.status_id.toString()).toBe(parentDisabledStatus._id.toString());

    // 6. Enable Category (cascades down)
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableServiceEntityService.execute(
        new mongoose.Types.ObjectId(categoryId),
        testUser._id
      );
    });
    expect(enableResult.result.code).toBe(200);

    // Verify subcategory and service are reactivated
    const dbSubcategoryEnabled = await BaseServiceModel.findById(subcategoryId);
    expect(dbSubcategoryEnabled!.is_active).toBe(true);
    expect(dbSubcategoryEnabled!.status_id.toString()).toBe(activeStatus._id.toString());

    const dbServiceEnabled = await BaseServiceModel.findById(serviceId);
    expect(dbServiceEnabled!.is_active).toBe(true);
    expect(dbServiceEnabled!.status_id.toString()).toBe(activeStatus._id.toString());

    // 7. Delete Category (cascades down)
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult = await deleteServiceEntityService.execute(
        new mongoose.Types.ObjectId(categoryId),
        testUser._id,
        true
      );
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify descendants are deactivated and status is parent_deleted
    const dbSubcategoryDeleted = await BaseServiceModel.findById(subcategoryId);
    expect(dbSubcategoryDeleted!.is_active).toBe(false);
    expect(dbSubcategoryDeleted!.status_id.toString()).toBe(parentDeletedStatus._id.toString());

    const dbServiceDeleted = await BaseServiceModel.findById(serviceId);
    expect(dbServiceDeleted!.is_active).toBe(false);
    expect(dbServiceDeleted!.status_id.toString()).toBe(parentDeletedStatus._id.toString());
  });
});
