import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listAuthSessionService from "@/resources/v1/auth-sessions/services/list-auth-session.service";
import RefreshSessionModel from "@/database/auth-sessions/auth-session-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import mongoose from "mongoose";
import { api } from "@/database/apis/apis-db-model";
import { moduleTypes } from "@/utils/definitions/constants/modules";
import { activityTypes } from "@/utils/definitions/constants/activity-types";

describe("ListAuthSessionService (Integration)", () => {
  let testUser: any;

  beforeAll(async () => {
    await RefreshSessionModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await api.ensureIndexes();
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
      last_name: "Lister",
      email: "sessionlister@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    // Seed api for buildWhereClause
    await api.create({
      activity_type: activityTypes.List,
      module: moduleTypes.AuthenticationSession as any,
      activity_name: "List",
      activity_code: "list",
      activity_method: "GET",
      url: "/api/v1/masters/auth-sessions",
      status: true,
      form_params: [],
      search_params: [],
      required_authentication: true,
    });

    // Seed some mock sessions in database
    await RefreshSessionModel.create([
      {
        userId: testUser._id,
        refreshTokenHash: "hash1",
        tokenId: "token1",
        deviceId: "device1",
        deviceName: "Web",
        device: { userAgent: "Mozilla", os: "Windows", browser: "Chrome", deviceType: "desktop" },
        ipAddress: "127.0.0.1",
        expiresAt: new Date(Date.now() + 100000),
      },
      {
        userId: testUser._id,
        refreshTokenHash: "hash2",
        tokenId: "token2",
        deviceId: "device2",
        deviceName: "Mobile",
        device: { userAgent: "Mozilla", os: "Android", browser: "Chrome Mobile", deviceType: "mobile" },
        ipAddress: "127.0.0.2",
        expiresAt: new Date(Date.now() + 100000),
      },
    ]);
  });

  it("should successfully list auth sessions", async () => {
    const mockReq = {
      baseUrl: "/api/v1/masters/auth-sessions",
      originalUrl: "/api/v1/masters/auth-sessions",
      method: "GET",
      query: {
        page: "1",
        limit: "10",
      },
      user: testUser,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await listAuthSessionService.execute(mockReq);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const rows = result.result.data[0].result.rows;
    expect(rows.length).toBe(2);
    expect(rows[0].device.id).toBe("device1");
    expect(rows[1].device.id).toBe("device2");
    expect(result.result.data[0].result.totalCount).toBe(2);
  });
});
