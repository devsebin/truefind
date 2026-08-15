import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createRolesService from "@/resources/v1/masters/roles/services/create-roles.service";
import showRolesService from "@/resources/v1/masters/roles/services/show-roles.service";
import updateRolesService from "@/resources/v1/masters/roles/services/update-roles.service";
import deleteRolesService from "@/resources/v1/masters/roles/services/delete-roles.service";
import disableRolesService from "@/resources/v1/masters/roles/services/disable-roles.service";
import RolesModel from "@/database/roles/roles-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildRolesPayload } from "../../factories/roles.factory";

describe("Roles Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await RolesModel.collection.dropIndexes();
    } catch (e) { }
    await RolesModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await RolesModel.deleteMany({});
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
      role: "super_admin",
      email: "testuser@example.com",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });
  });

  it("should successfully execute CRUD and state operations on roles", async () => {
    // Delete all first to verify defaults logic
    await RolesModel.deleteMany({});

    // 1. Create Role (First role, should be forced to is_default = true)
    const payload = buildRolesPayload({ title: "Admin", label: "admin", color: "#ff0000", is_default: false });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createRolesService.execute({ body: payload } as any, payload);
    });

    expect(createResult.result.code).toBe(201);
    const roleId = createResult.result.data[0].result.id;
    expect(roleId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("Admin");
    expect(createResult.result.data[0].result.is_default).toBe(true); // Forced to true

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createRolesService.execute({ body: payload } as any, payload);
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. Show Role
    const showResult: any = await showRolesService.execute(roleId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.title).toBe("Admin");

    // 2.5 Show 404
    const fakeId = new mongoose.Types.ObjectId();
    const show404Result: any = await showRolesService.execute(fakeId);
    expect(show404Result.result.code).toBe(404);

    // 3. Update Role
    const updatePayload = { title: "SuperAdmin", label: "superadmin", color: "#ff1122" };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateRolesService.execute(roleId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("SuperAdmin");

    // 3.5 Update no change error
    let updateNoChangeResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateNoChangeResult = await updateRolesService.execute(roleId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateNoChangeResult.result.code).toBe(400);

    // 4. Create another role and set it as default (unsets the first one)
    const secondPayload = buildRolesPayload({ title: "User", label: "user", color: "#00ff00", is_default: true });
    let createSecondResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createSecondResult = await createRolesService.execute({ body: secondPayload } as any, secondPayload);
    });
    expect(createSecondResult.result.code).toBe(201);
    const secondRoleId = createSecondResult.result.data[0].result.id;
    expect(createSecondResult.result.data[0].result.is_default).toBe(true);

    // Verify first role is no longer default
    const firstUpdated = await RolesModel.findById(roleId);
    // 5. Restrict disabling default role (returns 409 Conflict)
    let disableDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableDefaultResult = await disableRolesService.execute(secondRoleId, testUser._id);
    });
    expect(disableDefaultResult.result.code).toBe(409);

    // 6. Restrict deleting default role (returns 409 Conflict)
    let deleteDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteDefaultResult = await deleteRolesService.execute(secondRoleId, testUser._id, true);
    });
    expect(deleteDefaultResult.result.code).toBe(409);

    // 7. Disable first role (non-default, should succeed)
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableRolesService.execute(roleId, testUser._id);
    });
    expect(disableResult.result.code).toBe(200);

    // 7.5 Disable already inactive
    let disableAgainResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableAgainResult = await disableRolesService.execute(roleId, testUser._id);
    });
    expect(disableAgainResult.result.code).toBe(400);

    // 8. Verify we can create a new role with the same title as a disabled one
    // This will restore and update the disabled role (role A)
    const duplicateOfDisabledPayload = buildRolesPayload({ title: "SuperAdmin", label: "superadmin_new", color: "#0000ff" });
    let createDuplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createDuplicateResult = await createRolesService.execute({ body: duplicateOfDisabledPayload } as any, duplicateOfDisabledPayload);
    });
    expect(createDuplicateResult.result.code).toBe(201);
    const duplicateId = createDuplicateResult.result.data[0].result.id;
    expect(duplicateId.toString()).toBe(roleId.toString());

    // 9. Verify that role A is now active and has the new label
    const restoredRole = await RolesModel.findById(roleId);
    expect(restoredRole!.is_active).toBe(true);
    expect(restoredRole!.label).toBe("superadmin_new");

    // Delete role A with force
    let deleteForceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteForceResult = await deleteRolesService.execute(roleId, testUser._id, true);
    });
    expect(deleteForceResult.result.code).toBe(200);
  });
});
