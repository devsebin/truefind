import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createUnitsService from "@/resources/v1/masters/units/services/create-units.service";
import listUnitsService from "@/resources/v1/masters/units/services/list-units.service";
import showUnitsService from "@/resources/v1/masters/units/services/show-units.service";
import updateUnitsService from "@/resources/v1/masters/units/services/update-units.service";
import deleteUnitsService from "@/resources/v1/masters/units/services/delete-units.service";
import enableUnitsService from "@/resources/v1/masters/units/services/enable-units.service";
import disableUnitsService from "@/resources/v1/masters/units/services/disable-units.service";
import UnitsModel from "@/database/units/units-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildUnitsPayload } from "../../factories/units.factory";

describe("Units Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await UnitsModel.collection.dropIndexes();
    } catch (e) {}
    await UnitsModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await UnitsModel.deleteMany({});
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

  it("should successfully execute CRUD and state operations on units", async () => {
    // Delete all first to verify defaults logic
    await UnitsModel.deleteMany({});

    // 1. Create Unit (First unit, should be forced to is_default = true)
    const payload = buildUnitsPayload({ title: "KG", label: "kg", color: "#ff0000", is_default: false });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createUnitsService.execute({ body: payload } as any, payload);
    });

    expect(createResult.result.code).toBe(201);
    const unitId = createResult.result.data[0].result.id;
    expect(unitId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("KG");
    expect(createResult.result.data[0].result.is_default).toBe(true); // Forced to true

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createUnitsService.execute({ body: payload } as any, payload);
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. Show Unit
    const showResult: any = await showUnitsService.execute(unitId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.title).toBe("KG");

    // 2.5 Show 404
    const fakeId = new mongoose.Types.ObjectId();
    const show404Result: any = await showUnitsService.execute(fakeId);
    expect(show404Result.result.code).toBe(404);

    // 3. Update Unit
    const updatePayload = { title: "KiloGram", label: "kilogram", color: "#ff1122" };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateUnitsService.execute(unitId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("KiloGram");

    // 3.5 Update no change error
    let updateNoChangeResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateNoChangeResult = await updateUnitsService.execute(unitId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateNoChangeResult.result.code).toBe(400);

    // 4. Create another unit and set it as default (unsets the first one)
    const secondPayload = buildUnitsPayload({ title: "Litre", label: "litre", color: "#00ff00", is_default: true });
    let createSecondResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createSecondResult = await createUnitsService.execute({ body: secondPayload } as any, secondPayload);
    });
    expect(createSecondResult.result.code).toBe(201);
    const secondUnitId = createSecondResult.result.data[0].result.id;
    expect(createSecondResult.result.data[0].result.is_default).toBe(true);

    // Verify first unit is no longer default
    const firstUpdated = await UnitsModel.findById(unitId);
    expect(firstUpdated!.is_default).toBe(false);

    // 5. Restrict disabling default unit (returns 409 Conflict)
    let disableDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableDefaultResult = await disableUnitsService.execute(secondUnitId, testUser._id);
    });
    expect(disableDefaultResult.result.code).toBe(409);

    // 6. Restrict deleting default unit (returns 409 Conflict)
    let deleteDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteDefaultResult = await deleteUnitsService.execute(secondUnitId, testUser._id, true);
    });
    expect(deleteDefaultResult.result.code).toBe(409);

    // 7. Disable first unit (non-default, should succeed)
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableUnitsService.execute(unitId, testUser._id);
    });
    expect(disableResult.result.code).toBe(200);

    // 7.5 Disable already inactive
    let disableAgainResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableAgainResult = await disableUnitsService.execute(unitId, testUser._id);
    });
    expect(disableAgainResult.result.code).toBe(400);

    // 8. Verify we can create a new unit with the same title as a disabled one
    // This will restore and update the disabled unit (unit A)
    const duplicateOfDisabledPayload = buildUnitsPayload({ title: "KiloGram", label: "kilogram_new", color: "#0000ff" });
    let createDuplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createDuplicateResult = await createUnitsService.execute({ body: duplicateOfDisabledPayload } as any, duplicateOfDisabledPayload);
    });
    expect(createDuplicateResult.result.code).toBe(201);
    const duplicateId = createDuplicateResult.result.data[0].result.id;
    expect(duplicateId.toString()).toBe(unitId.toString());

    // 9. Verify that unit A is now active and has the new label
    const restoredUnit = await UnitsModel.findById(unitId);
    expect(restoredUnit!.is_active).toBe(true);
    expect(restoredUnit!.label).toBe("kilogram_new");

    // Delete unit A with force
    let deleteForceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteForceResult = await deleteUnitsService.execute(unitId, testUser._id, true);
    });
    expect(deleteForceResult.result.code).toBe(200);
  });
});
