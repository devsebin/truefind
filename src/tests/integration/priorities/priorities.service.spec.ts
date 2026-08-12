import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createPrioritiesService from "@/resources/v1/masters/priorities/services/create-priorities.service";
import listPrioritiesService from "@/resources/v1/masters/priorities/services/list-priorities.service";
import showPrioritiesService from "@/resources/v1/masters/priorities/services/show-priorities.service";
import updatePrioritiesService from "@/resources/v1/masters/priorities/services/update-priorities.service";
import deletePrioritiesService from "@/resources/v1/masters/priorities/services/delete-priorities.service";
import enablePrioritiesService from "@/resources/v1/masters/priorities/services/enable-priorities.service";
import disablePrioritiesService from "@/resources/v1/masters/priorities/services/disable-priorities.service";
import PrioritiesModel from "@/database/priorities/priorities-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildPrioritiesPayload } from "../../factories/priorities.factory";

describe("Priorities Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await PrioritiesModel.collection.dropIndexes();
    } catch (e) {}
    await PrioritiesModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await PrioritiesModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });
  });

  it("should successfully execute CRUD and state operations on priorities", async () => {
    // Delete all first to verify defaults logic
    await PrioritiesModel.deleteMany({});

    // 1. Create Priority (First priority, should be forced to is_default = true)
    const payload = buildPrioritiesPayload({ title: "Urgent", label: "urgent", color: "#ff0000", is_default: false });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createPrioritiesService.execute({ body: payload } as any, payload);
    });

    expect(createResult.result.code).toBe(201);
    const priorityId = createResult.result.data[0].result.id;
    expect(priorityId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("Urgent");
    expect(createResult.result.data[0].result.is_default).toBe(true); // Forced to true

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createPrioritiesService.execute({ body: payload } as any, payload);
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. Show Priority
    const showResult: any = await showPrioritiesService.execute(priorityId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.title).toBe("Urgent");

    // 2.5 Show 404
    const fakeId = new mongoose.Types.ObjectId();
    const show404Result: any = await showPrioritiesService.execute(fakeId);
    expect(show404Result.result.code).toBe(404);

    // 3. Update Priority
    const updatePayload = { title: "Super Urgent", label: "super_urgent", color: "#ff1122" };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updatePrioritiesService.execute(priorityId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("Super Urgent");

    // 3.5 Update no change error
    let updateNoChangeResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateNoChangeResult = await updatePrioritiesService.execute(priorityId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateNoChangeResult.result.code).toBe(400);

    // 4. Create another priority and set it as default (unsets the first one)
    const secondPayload = buildPrioritiesPayload({ title: "High", label: "high", color: "#00ff00", is_default: true });
    let createSecondResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createSecondResult = await createPrioritiesService.execute({ body: secondPayload } as any, secondPayload);
    });
    expect(createSecondResult.result.code).toBe(201);
    const secondPriorityId = createSecondResult.result.data[0].result.id;
    expect(createSecondResult.result.data[0].result.is_default).toBe(true);

    // Verify first priority is no longer default
    const firstUpdated = await PrioritiesModel.findById(priorityId);
    expect(firstUpdated!.is_default).toBe(false);

    // 5. Restrict disabling default priority (returns 409 Conflict)
    let disableDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableDefaultResult = await disablePrioritiesService.execute(secondPriorityId, testUser._id);
    });
    expect(disableDefaultResult.result.code).toBe(409);

    // 6. Restrict deleting default priority (returns 409 Conflict)
    let deleteDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteDefaultResult = await deletePrioritiesService.execute(secondPriorityId, testUser._id, true);
    });
    expect(deleteDefaultResult.result.code).toBe(409);

    // 7. Disable first priority (non-default, should succeed)
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disablePrioritiesService.execute(priorityId, testUser._id);
    });
    expect(disableResult.result.code).toBe(200);

    // 7.5 Disable already inactive
    let disableAgainResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableAgainResult = await disablePrioritiesService.execute(priorityId, testUser._id);
    });
    expect(disableAgainResult.result.code).toBe(400);

    // 8. Verify we can create a new priority with the same title as a disabled one
    // This will restore and update the disabled priority (priority A)
    const duplicateOfDisabledPayload = buildPrioritiesPayload({ title: "Super Urgent", label: "super_urgent_new", color: "#0000ff" });
    let createDuplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createDuplicateResult = await createPrioritiesService.execute({ body: duplicateOfDisabledPayload } as any, duplicateOfDisabledPayload);
    });
    expect(createDuplicateResult.result.code).toBe(201);
    const duplicateId = createDuplicateResult.result.data[0].result.id;
    expect(duplicateId.toString()).toBe(priorityId.toString());

    // 9. Verify that priority A is now active and has the new label
    const restoredPriority = await PrioritiesModel.findById(priorityId);
    expect(restoredPriority!.is_active).toBe(true);
    expect(restoredPriority!.label).toBe("super_urgent_new");

    // Delete priority A with force
    let deleteForceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteForceResult = await deletePrioritiesService.execute(priorityId, testUser._id, true);
    });
    expect(deleteForceResult.result.code).toBe(200);
  });
});
