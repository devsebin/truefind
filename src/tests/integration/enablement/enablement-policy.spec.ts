import request from "supertest";
import mongoose from "mongoose";
import Index from "../../../index";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import EnablementPolicyAuditModel from "@/database/enablement-policy-audits/enablement-policy-audits-db-model";
import { registerCountryConditions } from "@/resources/v1/masters/countries/enablement/register-country-conditions";
import { PolicyStatus } from "@/core/enablement/types/policy";
import { ruleEngine } from "@/core/enablement/engine/rule-engine";

// Mock authentication & authorization middlewares to bypass auth in test environment
jest.mock("@/middlewares/authentication-validation.middleware", () => ({
  __esModule: true,
  default: (req: any, _res: any, next: any) => {
    req.user = { _id: new mongoose.Types.ObjectId(), name: "Admin Test", email: "admin@test.com" };
    next();
  },
}));

jest.mock("@/middlewares/authorization-api.middleware", () => ({
  authorizationApi: (_req: any, _res: any, next: any) => next(),
}));

describe("Enablement Policy Module (Integration)", () => {
  let app: any;

  beforeAll(async () => {
    registerCountryConditions();
    const serverInstance = new Index(3000);
    app = serverInstance.express;
  });

  afterEach(async () => {
    await EnablementPolicyModel.deleteMany({});
    await EnablementPolicyAuditModel.deleteMany({});
  });

  it("should list registered conditions metadata", async () => {
    const res = await request(app).get("/api/v1/enablement/conditions?entityType=COUNTRY");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const types = res.body.data.map((c: any) => c.type);
    expect(types).toContain("HAS_ACTIVE_REGION");
    expect(types).toContain("HAS_SMS_PROVIDER");
    expect(types).toContain("HAS_CONFIGURATION");
  });

  it("should create a draft policy, validate, publish, and record audits", async () => {
    // 1. Create Draft Policy
    const draftPayload = {
      entity_type: "COUNTRY",
      name: "Country Enablement Base Policy",
      description: "Default policy requiring active region and SMS provider",
      rules: {
        kind: "GROUP",
        operator: "AND",
        children: [
          {
            kind: "CONDITION",
            type: "HAS_ACTIVE_REGION",
            params: { minimum: 1 },
          },
          {
            kind: "CONDITION",
            type: "HAS_SMS_PROVIDER",
            params: { minimum: 1 },
          },
        ],
      },
    };

    const createRes = await request(app).post("/api/v1/enablement/policies").send(draftPayload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe(PolicyStatus.DRAFT);
    expect(createRes.body.data.version).toBe(1);
    const policyId = createRes.body.data._id;

    // 2. Validate Policy
    const validateRes = await request(app).post(`/api/v1/enablement/policies/${policyId}/validate`);
    expect(validateRes.status).toBe(200);
    expect(validateRes.body.data.valid).toBe(true);

    // 3. Publish Policy
    const publishRes = await request(app).post(`/api/v1/enablement/policies/${policyId}/publish`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe(PolicyStatus.PUBLISHED);

    // 4. Verify Audits Recorded
    const auditRes = await request(app).get(`/api/v1/enablement/audits?policyId=${policyId}`);
    expect(auditRes.status).toBe(200);
    expect(auditRes.body.data.length).toBeGreaterThanOrEqual(2); // CREATED & PUBLISHED
  });

  it("should reject updating a published policy (immutability)", async () => {
    const policy = await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Published Country Policy",
      version: 1,
      status: PolicyStatus.PUBLISHED,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 1 },
      },
    });

    const updateRes = await request(app)
      .put(`/api/v1/enablement/policies/${policy._id}`)
      .send({ name: "Attempt to mutate published policy" });

    expect(updateRes.status).toBe(400);
  });

  it("should support publishing a new version and archiving the prior published version", async () => {
    const v1 = await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Country Policy v1",
      version: 1,
      status: PolicyStatus.PUBLISHED,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 1 },
      },
    });

    const v2Draft = await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Country Policy v2",
      version: 2,
      status: PolicyStatus.DRAFT,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 2 },
      },
    });

    const publishRes = await request(app).post(`/api/v1/enablement/policies/${v2Draft._id}/publish`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe(PolicyStatus.PUBLISHED);

    const checkV1 = await EnablementPolicyModel.findById(v1._id);
    expect(checkV1?.status).toBe(PolicyStatus.ARCHIVED);
  });

  it("should support rollback to a historical version by creating a new published version", async () => {
    const v1 = await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Country Policy v1",
      version: 1,
      status: PolicyStatus.ARCHIVED,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 1 },
      },
    });

    const v2 = await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Country Policy v2",
      version: 2,
      status: PolicyStatus.PUBLISHED,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 5 },
      },
    });

    const rollbackRes = await request(app).post(`/api/v1/enablement/policies/${v1._id}/rollback`);
    expect(rollbackRes.status).toBe(200);
    expect(rollbackRes.body.data.version).toBe(3);
    expect(rollbackRes.body.data.status).toBe(PolicyStatus.PUBLISHED);
    expect(rollbackRes.body.data.rules).toEqual(v1.rules);

    // v2 should now be archived
    const checkV2 = await EnablementPolicyModel.findById(v2._id);
    expect(checkV2?.status).toBe(PolicyStatus.ARCHIVED);
  });
});
