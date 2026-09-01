import EnablementPolicyModel from "../../../database/enablement-policies/enablement-policies-db-model";
import EnablementPolicyAuditModel from "../../../database/enablement-policy-audits/enablement-policy-audits-db-model";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";
import { PolicyAuditAction, PolicyStatus } from "../../../core/enablement/types/policy";

export const seedEnablementPolicies = async () => {
  const user = await User.findOne({ role: getRoleId("super_admin") });
  const userId = user ? user._id : undefined;

  // Clean existing enablement policies & audits
  await EnablementPolicyAuditModel.deleteMany({});
  await EnablementPolicyModel.deleteMany({});

  // 1. Default Published Country Enablement Policy
  const countryPolicy = await EnablementPolicyModel.create({
    entity_type: "COUNTRY",
    name: "Default Country Enablement Policy",
    description: "Requires at least 1 active region, 1 configured SMS provider, and valid configuration",
    version: 1,
    status: PolicyStatus.PUBLISHED,
    rules: {
      kind: "GROUP",
      operator: "AND",
      children: [
        {
          kind: "CONDITION",
          type: "HAS_ACTIVE_REGION",
          params: {
            minimum: 1,
          },
        },
        {
          kind: "CONDITION",
          type: "HAS_SMS_PROVIDER",
          params: {
            minimum: 1,
            requireTested: false,
          },
        },
        {
          kind: "CONDITION",
          type: "HAS_CONFIGURATION",
          params: {
            requireCurrency: true,
            requirePhoneCode: true,
            requireContinent: true,
          },
        },
      ],
    },
    effective_from: new Date(),
    effective_until: null,
    created_by: userId,
    updated_by: userId,
  });

  // Log creation & publish audits
  await EnablementPolicyAuditModel.create({
    policy_id: countryPolicy._id,
    entity_type: "COUNTRY",
    version: 1,
    action: PolicyAuditAction.CREATED,
    performed_by: userId,
    rules_snapshot: countryPolicy.rules,
    notes: "Default Country Enablement Policy seeded",
  });

  await EnablementPolicyAuditModel.create({
    policy_id: countryPolicy._id,
    entity_type: "COUNTRY",
    version: 1,
    action: PolicyAuditAction.PUBLISHED,
    performed_by: userId,
    new_version: 1,
    rules_snapshot: countryPolicy.rules,
    notes: "Initial publication of default country policy",
  });

  console.log("  - Seeded Country Enablement Policy (v1, PUBLISHED)");
};
