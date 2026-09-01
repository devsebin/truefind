

Runtime Configurable Enablement Rules — Requirements Specification
1. Overview

Implement a generic, runtime-configurable enablement/eligibility rule engine for a Node.js + TypeScript application.

The system must allow administrators to configure the conditions under which documents/entities in different collections can be considered eligible for enablement, without requiring a code deployment for changes to rule configuration.

The system must be generic enough to support multiple entity/collection types such as:

Country
Region
SMS Provider
Configuration
Other future collections/entities

The rule engine itself must remain controlled by application code. Administrators may configure which supported conditions are applied, their parameters, and how conditions are logically combined, but must not be able to execute arbitrary JavaScript/TypeScript or database queries.

2. Core Concepts

The system consists of four primary concepts:

Condition
Rule
Policy
Rule Engine
2.1 Condition

A condition is a developer-defined, executable business capability.

Examples:

HAS_ACTIVE_REGION
HAS_SMS_PROVIDER
HAS_CONFIGURATION
IS_ACTIVE
HAS_ACTIVE_CHILDREN
HAS_VALID_CREDENTIALS

The implementation of a condition exists in TypeScript.

Example:

HAS_ACTIVE_REGION


may mean:

The entity must have at least N active and enabled regions.

Administrators must never define the implementation of a condition.

2.2 Rule

A rule is a configured instance of a condition.

Example:

{
  "kind": "CONDITION",
  "type": "HAS_ACTIVE_REGION",
  "params": {
    "minimum": 1
  }
}


The administrator controls:

Which condition is used
Condition parameters
Logical composition with other conditions
2.3 Policy

A policy is the complete enablement definition for an entity type.

Example:

Country Enablement Policy

ALL:
  - Has at least 1 active region
  - Has at least 1 SMS provider
  - Has valid configuration


Each entity type may have its own enablement policy.

Examples:

CountryEnablementPolicy
RegionEnablementPolicy
SmsProviderEnablementPolicy

2.4 Rule Engine

The rule engine is responsible for:

Loading the applicable policy
Evaluating the policy against an entity
Evaluating nested rule groups
Executing registered condition implementations
Returning detailed evaluation results
Reporting failed conditions and their reasons

The rule engine must be generic and must not contain entity-specific business logic.

3. Primary Business Requirement

An entity should only be considered eligible for enablement when all required conditions defined by the currently active policy are satisfied.

For example, a Country may require:

Country is eligible when:

1. At least 1 active and enabled Region exists
2. At least 1 SMS Provider is linked to the Country
3. At least 1 valid configuration exists


The rules must be configurable by administrators.

An administrator should be able to change:

At least 1 active region


to:

At least 2 active regions


without requiring a code deployment.

4. Important Architectural Principle

The system must separate:

Developer-controlled logic


from:

Admin-controlled configuration

Developer controls
Available condition types
Condition implementation
Condition validation
Data access required by a condition
Allowed parameters
Parameter types
Parameter ranges
Security constraints
Administrator controls
Which conditions are enabled in a policy
Condition parameter values
AND / OR / NOT composition
Policy activation
Policy version publishing

Administrators must NOT be allowed to provide arbitrary executable code.

5. Generic Rule Model

The rule model must support nested logical expressions.

At minimum, support:

AND
OR
NOT
CONDITION

Example:

{
  "kind": "GROUP",
  "operator": "AND",
  "children": [
    {
      "kind": "CONDITION",
      "type": "HAS_ACTIVE_REGION",
      "params": {
        "minimum": 1
      }
    },
    {
      "kind": "CONDITION",
      "type": "HAS_SMS_PROVIDER",
      "params": {
        "minimum": 1
      }
    }
  ]
}


The rule model must support arbitrary nesting.

Example:

AND
├── HAS_ACTIVE_REGION
├── HAS_SMS_PROVIDER
└── OR
    ├── HAS_TWILIO_PROVIDER
    └── HAS_VONAGE_PROVIDER


This represents:

HAS_ACTIVE_REGION
AND
HAS_SMS_PROVIDER
AND
(
    HAS_TWILIO_PROVIDER
    OR
    HAS_VONAGE_PROVIDER
)

6. TypeScript Rule Types

A recommended model is:

type RuleNode =
  | ConditionNode
  | GroupNode;

interface ConditionNode {
  kind: 'CONDITION';

  type: ConditionType;

  params?: Record<string, unknown>;
}

interface GroupNode {
  kind: 'GROUP';

  operator: 'AND' | 'OR';

  children: RuleNode[];
}


ConditionType must be a controlled set of developer-defined condition identifiers.

Example:

type ConditionType =
  | 'HAS_ACTIVE_REGION'
  | 'HAS_SMS_PROVIDER'
  | 'HAS_CONFIGURATION'
  | 'IS_ACTIVE';


The implementation should make adding new conditions straightforward.

7. Condition Evaluator Interface

Each condition must implement a common interface.

Recommended structure:

interface ConditionEvaluator<T> {
  type: ConditionType;

  evaluate(
    entity: T,
    params: Record<string, unknown>,
  ): Promise<ConditionResult>;
}


Example:

interface ConditionResult {
  passed: boolean;

  metadata?: Record<string, unknown>;

  message?: string;
}


A condition should have a single responsibility.

Example:

HasActiveRegionEvaluator


must only be responsible for determining whether the entity has the required number of active/enabled regions.

8. Condition Registry

The application must provide a registry for available condition evaluators.

Conceptually:

ConditionRegistry
    |
    +-- HAS_ACTIVE_REGION
    |
    +-- HAS_SMS_PROVIDER
    |
    +-- HAS_CONFIGURATION
    |
    +-- IS_ACTIVE


The rule engine must resolve conditions through the registry.

The rule engine must not contain large if/else or switch statements for every condition.

Example:

registry.register(
  new HasActiveRegionEvaluator(...)
);

registry.register(
  new HasSmsProviderEvaluator(...)
);


The registry must reject unknown condition types.

9. Condition Metadata

The backend should expose metadata describing available conditions so the admin UI can dynamically construct a rule builder.

Example API:

GET /enablement/conditions?entityType=COUNTRY


Example response:

[
  {
    "type": "HAS_ACTIVE_REGION",
    "label": "Has active region",
    "description": "Requires at least N active and enabled regions",
    "parameters": {
      "minimum": {
        "type": "number",
        "default": 1,
        "minimum": 1
      }
    }
  },
  {
    "type": "HAS_SMS_PROVIDER",
    "label": "Has SMS provider",
    "description": "Requires at least N SMS providers",
    "parameters": {
      "minimum": {
        "type": "number",
        "default": 1,
        "minimum": 1
      }
    }
  }
]


This metadata allows the frontend to build a generic rule configuration UI.

10. Parameter Validation

Every condition must validate its parameters.

For example:

{
  "type": "HAS_ACTIVE_REGION",
  "params": {
    "minimum": -10
  }
}


must be rejected.

Similarly:

{
  "type": "UNKNOWN_CONDITION"
}


must be rejected.

Condition definitions should describe:

Parameter name
Parameter type
Required/optional status
Default value
Minimum/maximum values where applicable
Allowed enum values where applicable

Validation must occur before a policy can be published.

11. Policy Database Model

Create a persistent policy model/table/collection.

Recommended fields:

id
entityType
name
version
status
rules
effectiveFrom
effectiveUntil
createdBy
createdAt
updatedBy
updatedAt


Where:

status =
    DRAFT
    PUBLISHED
    ARCHIVED


The rules field should contain the rule tree.

If using PostgreSQL, JSONB is recommended for storing the rule tree.

If using MongoDB, store the rule tree as a nested document.

12. Policy Versioning

Policies must be versioned.

Example:

Country Policy

v1 - ARCHIVED
v2 - PUBLISHED
v3 - DRAFT


Published policies must be immutable.

If an administrator modifies a published policy:

DO NOT modify v2


Instead:

v2 -> create v3


The new policy remains DRAFT until explicitly published.

This provides:

Auditability
Rollback
Change history
Safe configuration
Clear production behavior
13. Policy Lifecycle

Recommended lifecycle:

DRAFT
  |
  | publish
  v
PUBLISHED
  |
  | replaced by newer version
  v
ARCHIVED


Only one policy version for a given entity type should normally be active at a time.

Publishing a new policy should:

Validate the entire rule tree
Validate all condition types
Validate all condition parameters
Verify the policy applies to the requested entity type
Archive/supersede the previous published policy
Publish the new version
Record the administrator who performed the action
14. Optional Effective Dates

Policies should support optional effective dates.

Example:

Country Policy v5

Status:
PUBLISHED

Effective From:
2026-10-01 00:00:00


This allows administrators to prepare future rule changes without immediately changing current behavior.

The policy resolver must select the policy based on:

Entity type
Current time
Policy status
Effective date
15. Rule Evaluation Result

The engine must return more than a boolean.

Recommended result:

interface RuleEvaluationResult {
  passed: boolean;

  policyId: string;

  policyVersion: number;

  result: RuleResult;
}


Nested results should preserve the structure of the evaluated rule tree.

Example:

{
  "passed": false,
  "policyVersion": 3,
  "result": {
    "operator": "AND",
    "children": [
      {
        "type": "HAS_ACTIVE_REGION",
        "passed": true,
        "metadata": {
          "actual": 2,
          "required": 1
        }
      },
      {
        "type": "HAS_SMS_PROVIDER",
        "passed": false,
        "metadata": {
          "actual": 0,
          "required": 1
        }
      }
    ]
  }
}


This information should be usable by:

Admin UI
API responses
Logging
Monitoring
Debugging
Support tools
16. Failure Reasons

Every failed condition should provide a meaningful machine-readable code and human-readable message.

Example:

{
  "passed": false,
  "code": "HAS_SMS_PROVIDER",
  "message": "Country must have at least one SMS provider",
  "metadata": {
    "actual": 0,
    "required": 1
  }
}


The frontend should be able to display:

Cannot enable Country

✓ Active regions
  2 found, minimum 1

✗ SMS provider
  0 found, minimum 1

17. Enablement vs Entity Status

The system must distinguish between:

Manually configured entity status
Calculated eligibility

Do not make the persisted enabled flag the only source of truth when eligibility depends on other entities.

Recommended conceptual model:

interface Entity {
  id: string;

  manuallyEnabled: boolean;
}


Then:

eligible =
    all configured rules pass

finalEnabled =
    manuallyEnabled
    AND
    eligible


This prevents stale states such as:

Country.enabled = true


while:

Country has no active regions
Country has no SMS provider

18. Validation vs Enablement vs Authorization

These concerns must remain separate.

Validation

Determines whether an entity can be created/updated.

Example:

Country name is required
ISO code must be valid
ISO code must be unique

Enablement

Determines whether an entity satisfies business conditions for enablement.

Example:

At least one active region
At least one SMS provider
Valid configuration

Authorization

Determines whether the current user is allowed to perform the operation.

Example:

User must have COUNTRY_ADMIN permission


Do not combine these concerns into a single rule system unless there is a strong architectural reason.

19. Admin Rule Builder

The admin UI should provide a visual rule builder.

Example:

Enable Country when

┌──────────────────────────────────────┐
│ ALL                                  │
│                                      │
│ Has active region       >= [1]       │
│                                      │
│ Has SMS provider        >= [1]       │
│                                      │
│ Has configuration        [Yes]       │
│                                      │
│ [+ Add condition]                    │
└──────────────────────────────────────┘

                [Save Draft]
                [Publish]


For nested expressions:

ALL
├── Has active region >= 1
├── Has SMS provider >= 1
└── ANY
    ├── Has Twilio provider
    └── Has Vonage provider


The UI should not need to know the implementation details of each condition.

It should use condition metadata returned by the backend.

20. Admin APIs

At minimum, provide APIs conceptually equivalent to:

GET    /enablement/conditions
GET    /enablement/policies/:entityType
GET    /enablement/policies/:entityType/:version

POST   /enablement/policies
PUT    /enablement/policies/:id

POST   /enablement/policies/:id/validate
POST   /enablement/policies/:id/publish

POST   /enablement/policies/:entityType/evaluate/:entityId


Exact URL conventions may be adapted to the existing project's API standards.

21. Policy Validation API

Administrators should be able to validate a policy before publishing it.

Example:

POST /enablement/policies/:id/validate


Response:

{
  "valid": false,
  "errors": [
    {
      "path": "children[1].params.minimum",
      "code": "INVALID_PARAMETER",
      "message": "minimum must be greater than or equal to 1"
    }
  ]
}


Validation should detect:

Unknown conditions
Unsupported conditions for an entity type
Missing required parameters
Invalid parameter types
Invalid parameter values
Invalid logical groups
Empty groups
Invalid nesting
Circular references if references are introduced later
22. Security Requirements

The rule configuration must NEVER allow arbitrary executable code.

Do not support configuration such as:

eval(...)


or:

JavaScript expression


or arbitrary SQL:

SELECT ...


The database must contain a controlled rule DSL.

For example:

{
  "type": "HAS_ACTIVE_REGION",
  "params": {
    "minimum": 2
  }
}


The application determines what HAS_ACTIVE_REGION means.

The administrator only controls how it is configured.

23. Performance Requirements

Rule evaluation may require database queries.

Avoid an architecture where evaluating many entities causes an uncontrolled number of database queries.

For example:

10,000 countries
x
5 rules
=
50,000 database queries


The implementation should:

Avoid unnecessary queries
Reuse data where possible
Use efficient count/existence queries
Prefer EXISTS where only existence matters
Consider batching for bulk evaluation
Avoid N+1 query patterns
Consider caching policy configuration
Consider caching static condition metadata

For individual enablement operations, normal rule evaluation is acceptable.

For bulk operations, provide a separate optimized evaluation strategy where necessary.

24. Policy Caching

Published policies are generally read much more frequently than they are changed.

The application should consider caching the currently published policy.

Possible cache layers:

Application memory
Redis
Other existing project cache


When a policy is published:

Invalidate old policy cache
Load/cache new policy


Caching must not compromise correctness when policy changes.

25. Audit Requirements

All policy changes must be auditable.

Record:

Policy ID
Entity type
Version
Action
User/admin ID
Timestamp
Previous version
New version
Rule configuration

Actions should include at minimum:

CREATED
UPDATED
VALIDATED
PUBLISHED
ARCHIVED
ROLLED_BACK


The audit log must be immutable.

26. Rollback

The system should support rollback to a previous policy version.

Example:

v1 ARCHIVED
v2 ARCHIVED
v3 PUBLISHED


If v3 causes problems:

Rollback v3 -> v2


This should create a new version rather than mutating historical data.

For example:

v4 = copy of v2
v4 = PUBLISHED


Do not change v2 itself.

27. Testing Requirements

Every condition evaluator must have unit tests.

Example:

HasActiveRegionEvaluator

✓ passes when region count >= minimum
✓ fails when region count < minimum
✓ fails when all regions are inactive
✓ fails when all regions are disabled
✓ validates minimum parameter
✓ handles missing parameters correctly


The rule engine must have tests for:

✓ AND
✓ OR
✓ nested AND
✓ nested OR
✓ NOT
✓ deeply nested expressions
✓ unknown condition
✓ invalid rule
✓ condition failure propagation


Policy tests should cover:

✓ draft policy
✓ publish policy
✓ versioning
✓ replacing published policy
✓ effective dates
✓ rollback
✓ invalid policy cannot be published

28. Observability

Rule evaluation should be observable.

Useful information to log/measure:

entityType
entityId
policyId
policyVersion
evaluationDuration
passed
failedConditionCodes


Avoid logging sensitive entity data or credentials.

Metrics should ideally include:

rule_evaluation_total
rule_evaluation_failed_total
rule_evaluation_duration
policy_publish_total

29. Extensibility

Adding a new condition should require minimal changes.

For example, adding:

HAS_ACTIVE_CONFIGURATION


should involve:

Implement evaluator
Register evaluator
Add condition metadata
Add tests

It should NOT require modifying the core rule engine.

Similarly, adding a new entity type should involve:

New entity
    +
New policy
    +
Applicable conditions


without rewriting the engine.

30. Example: Country Policy

Initial policy:

{
  "entityType": "COUNTRY",
  "version": 1,
  "rules": {
    "kind": "GROUP",
    "operator": "AND",
    "children": [
      {
        "kind": "CONDITION",
        "type": "HAS_ACTIVE_REGION",
        "params": {
          "minimum": 1
        }
      },
      {
        "kind": "CONDITION",
        "type": "HAS_SMS_PROVIDER",
        "params": {
          "minimum": 1
        }
      }
    ]
  }
}


The country is eligible only when:

active/enabled regions >= 1
AND
SMS providers >= 1

31. Example: More Complex Country Policy
{
  "entityType": "COUNTRY",
  "version": 2,
  "rules": {
    "kind": "GROUP",
    "operator": "AND",
    "children": [
      {
        "kind": "CONDITION",
        "type": "HAS_ACTIVE_REGION",
        "params": {
          "minimum": 2
        }
      },
      {
        "kind": "CONDITION",
        "type": "HAS_SMS_PROVIDER",
        "params": {
          "minimum": 1
        }
      },
      {
        "kind": "GROUP",
        "operator": "OR",
        "children": [
          {
            "kind": "CONDITION",
            "type": "HAS_TWILIO_PROVIDER"
          },
          {
            "kind": "CONDITION",
            "type": "HAS_VONAGE_PROVIDER"
          }
        ]
      }
    ]
  }
}


Equivalent business logic:

Country is eligible when:

active regions >= 2

AND

SMS providers >= 1

AND

(
    Twilio provider exists
    OR
    Vonage provider exists
)

32. Recommended Project Structure

Recommended structure for a Node.js + TypeScript project:

src/
├── core/
│   └── enablement/
│       ├── types/
│       │   ├── rule-node.ts
│       │   ├── rule-result.ts
│       │   └── condition.ts
│       │
│       ├── engine/
│       │   └── rule-engine.ts
│       │
│       ├── registry/
│       │   └── condition-registry.ts
│       │
│       ├── policy/
│       │   ├── policy-resolver.ts
│       │   └── policy-validator.ts
│       │
│       └── operators/
│           ├── all-of.ts
│           ├── any-of.ts
│           └── not.ts
│
├── modules/
│   ├── country/
│   │   └── enablement/
│   │       ├── country-enableable-policy.ts
│   │       └── conditions/
│   │           ├── has-active-region.ts
│   │           ├── has-sms-provider.ts
│   │           └── has-configuration.ts
│   │
│   ├── region/
│   │   └── enablement/
│   │       └── conditions/
│   │
│   └── provider/
│       └── enablement/
│           └── conditions/
│
└── modules/
    └── enablement-admin/
        ├── controller/
        ├── service/
        ├── dto/
        └── repository/


The exact structure may be adapted to the existing application's architecture.

33. Recommended Runtime Flow

When an entity is being enabled:

1. Request received
        |
        v
2. Authorization check
        |
        v
3. Load entity
        |
        v
4. Resolve active policy
        |
        v
5. Validate/load policy
        |
        v
6. Evaluate rule tree
        |
        v
7. Collect evaluation result
        |
        +---- FAILED ----> Return enablement failure
        |
        v
8. All rules passed
        |
        v
9. Enable entity


Example:

const policy =
  await policyResolver.getActivePolicy('COUNTRY');

const result =
  await ruleEngine.evaluate(
    policy.rules,
    country,
  );

if (!result.passed) {
  throw new EnablementError(result);
}

await countryRepository.enable(country.id);

34. Important Design Constraints

The implementation must follow these constraints:

Must
Be generic across entity/collection types
Support runtime configuration
Support nested logical expressions
Support AND / OR / NOT
Return detailed failure information
Validate policies before publishing
Version published policies
Keep published policies immutable
Support audit history
Prevent arbitrary code execution
Separate enablement from validation
Separate enablement from authorization
Allow new conditions to be added without modifying the core rule engine
Be testable
Avoid N+1 queries
Support future policy caching
Should
Support effective dates
Support rollback
Expose condition metadata for dynamic admin UI
Support policy preview/testing
Provide evaluation metrics
Support bulk evaluation optimization
Must Not
Execute arbitrary JavaScript from database configuration
Execute arbitrary SQL from rule configuration
Hard-code all conditions into the rule engine
Modify published policies in place
Make enabled status the sole source of truth when eligibility depends on related entities
Couple the rule engine to a specific ORM/database
Put entity-specific business logic into the generic engine
35. Recommended Initial Scope

The first implementation should focus on:

Core
RuleNode
ConditionNode
GroupNode
AND
OR
NOT
ConditionEvaluator
ConditionRegistry
RuleEngine
RuleResult
Policy
Policy persistence
Entity type
Version
Draft/published/archived status
Rule JSON
Policy resolver
Policy validator
Admin
List available conditions
Create/update draft policy
Validate policy
Publish policy
View policy versions
View audit history
Conditions

Initially implement only the conditions actually required by the application.

For example:

HAS_ACTIVE_REGION
HAS_SMS_PROVIDER
HAS_CONFIGURATION


Do not build a huge generic condition language prematurely.

36. Definition of Done

The feature is considered complete when:

An administrator can create a Country enablement policy.
An administrator can configure multiple conditions.
An administrator can configure condition parameters.
An administrator can combine conditions using AND/OR/NOT.
Invalid conditions cannot be saved/published.
Unknown condition types are rejected.
Invalid parameters are rejected.
Policies support draft and published states.
Published policies are versioned and immutable.
A new policy can replace an existing published policy.
The application automatically uses the currently active policy.
No application deployment is required when only rule configuration changes.
Rule evaluation returns detailed pass/fail information.
The API/UI can explain why an entity is not eligible.
Conditions are implemented in TypeScript and registered with the condition registry.
Arbitrary code cannot be executed through policy configuration.
Unit tests cover individual conditions.
Unit/integration tests cover rule composition and policy lifecycle.
Evaluation does not introduce uncontrolled N+1 database queries.
Audit information is recorded for administrative policy changes.
37. Architectural Summary

The final architecture should follow this principle:

                 ADMIN
                   |
                   v
          Policy Configuration
                   |
                   v
              Database
                   |
                   v
            Policy Resolver
                   |
                   v
              Rule Engine
                   |
          +--------+--------+
          |                 |
          v                 v
    Rule Composition   Condition Registry
    AND / OR / NOT           |
                              |
               +--------------+--------------+
               |              |              |
               v              v              v
          Region Rule    SMS Rule      Config Rule
               |              |              |
               v              v              v
          Repositories / Domain Services


The central architectural boundary is:

                 CODE
                  |
      "What conditions exist?"
                  |
                  v
        Condition Implementations
                  |
                  |
==================+==================
                  |
                  v
              DATABASE
                  |
      "How are they configured?"
                  |
                  v
          Policy / Rule Tree


This provides runtime flexibility for administrators while keeping the system secure, type-safe, testable, maintainable, and extensible.

This should work well as a requirements/spec document for an AI coding agent. If you give it your existing project structure as additional context, the agent should be able to implement the framework without having to invent the architectural direction.