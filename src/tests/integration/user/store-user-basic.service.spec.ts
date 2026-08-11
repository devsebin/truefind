import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import storeUserBasicService from "@/resources/v1/users/services/store-user-basic.service";
import UserModel from "@/database/users/users-db-model";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import { requestContext } from "@/utils/context/request-context";
import mongoose from "mongoose";

describe("StoreUserBasicService (Integration)", () => {
  let testUser: any;
  let testDeclaimer: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    await UserModel.ensureIndexes();
    await DeclaimerModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Clean up
    await UserModel.deleteMany({});
    await DeclaimerModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    // Seed default status
    defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed default priority
    defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    // Seed a test user
    testUser = await UserModel.create({
      first_name: "Original",
      last_name: "User",
      email: "user@example.com",
      role: "user",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    // Seed a test declaimer
    testDeclaimer = await DeclaimerModel.create({
      key: "terms_of_service",
      title: "Terms of Service",
      content: "These are terms.",
      version: 1,
      is_latest: true,
      language: "en",
      country: new mongoose.Types.ObjectId(),
      status_id: defaultStatus._id,
    });
  });

  it("should successfully store user basic details and accept declaimer", async () => {
    const payload = {
      first_name: "John",
      last_name: "Doe",
      business_name: "John Doe Ventures",
      year_of_experience: 5,
      street_address: "123 Main St",
      city: "Auckland",
      zip: "1010",
      ird_number: "123-456-789",
      declaimer_id: testDeclaimer._id.toString(),
      is_gst_registered: true,
      gst_number: "GST-999-999",
    };

    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await storeUserBasicService.execute(testUser._id.toString(), mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.user_basic).toBeDefined();
    expect(result.result.data[0].result.user_basic.first_name).toBe("John");
    expect(result.result.data[0].result.user_basic.last_name).toBe("Doe");
    expect(result.result.data[0].result.user_basic.business_name).toBe("John Doe Ventures");
    expect(result.result.data[0].result.user_basic.declaimer).toBe(testDeclaimer._id.toString());

    // Verify persistence in DB
    const dbUser = await UserModel.findById(testUser._id);
    expect(dbUser).toBeDefined();
    expect(dbUser!.first_name).toBe("John");
    expect(dbUser!.last_name).toBe("Doe");
    expect(dbUser!.user_basic!.business_name).toBe("John Doe Ventures");

    // Verify declaimer accepted
    expect(dbUser!.declaimer).toBeDefined();
    expect(dbUser!.declaimer!.length).toBe(1);
    expect(dbUser!.declaimer![0].declaimer_id.toString()).toBe(testDeclaimer._id.toString());
    expect(dbUser!.declaimer![0].accepted).toBe(true);
  });

  it("should reject storing basic details if declaimer does not exist", async () => {
    const fakeDeclaimerId = new mongoose.Types.ObjectId().toString();
    const payload = {
      first_name: "John",
      last_name: "Doe",
      city: "Auckland",
      zip: "1010",
      ird_number: "123-456-789",
      declaimer_id: fakeDeclaimerId,
    };

    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await storeUserBasicService.execute(testUser._id.toString(), mockReq, payload);
    });

    expect(result.result.code).toBe(404);
    expect(result.result.message).toContain("Declaimer not found");
  });

  it("should reject storing basic details if user does not exist", async () => {
    const fakeUserId = new mongoose.Types.ObjectId().toString();
    const payload = {
      first_name: "John",
      last_name: "Doe",
      city: "Auckland",
      zip: "1010",
      ird_number: "123-456-789",
      declaimer_id: testDeclaimer._id.toString(),
    };

    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: fakeUserId }, async () => {
      result = await storeUserBasicService.execute(fakeUserId, mockReq, payload);
    });

    expect(result.result.code).toBe(404);
    expect(result.result.message).toContain("User not found");
  });
});
