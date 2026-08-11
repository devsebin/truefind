import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import createAuthSessionService from "@/resources/v1/auth-sessions/services/create-auth-session.service";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import mongoose from "mongoose";

describe("CreateAuthSessionService (Integration)", () => {
  let testUser: any;

  beforeAll(async () => {
    await RefreshSessionModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status
    const defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed default priority
    const defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    // Seed test user
    testUser = await UserModel.create({
      first_name: "Session",
      last_name: "Tester",
      email: "sessiontester@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });
  });

  it("should successfully create a new auth session for authenticated user", async () => {
    const mockReq = {
      user: testUser,
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      geoData: {
        query: "192.168.1.1",
        country: "France",
        city: "Paris",
      },
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createAuthSessionService.execute(mockReq);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.success).toBe(true);

    const sessionData = result.result.data[0].result;
    expect(sessionData.user.email).toBe("sessiontester@example.com");
    expect(sessionData.device.name).toBe("Web");
    expect(sessionData.device.browser).toBe("Chrome 120.0.0.0");
    expect(sessionData.location.ip_address).toBe("192.168.1.1");
    expect(sessionData.location.country).toBe("France");
    expect(sessionData.status).toBe("active");

    // Verify database persistence
    const dbSession = await RefreshSessionModel.findOne({ userId: testUser._id });
    expect(dbSession).toBeDefined();
    expect(dbSession!.deviceName).toBe("Web");
    expect(dbSession!.ipAddress).toBe("192.168.1.1");
  });
});
