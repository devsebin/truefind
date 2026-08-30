Generic Hierarchical Workflow Engine
1. Overview
The application contains multiple MongoDB collections where entities have relationships with other entities and their activation state depends on the state of related entities.

A typical example is a geographical hierarchy:

Country
   └── Region
         └── District
               └── Suburb

The entities are created independently by an administrator, but their ACTIVE / INACTIVE state depends on whether their child entities satisfy configured conditions.

Example:

Country
  → requires at least 1 ACTIVE Region

Region
  → requires at least 1 ACTIVE District

District
  → requires at least 1 ACTIVE Suburb

The goal is to create a generic workflow engine that can support this and future workflows without implementing separate activation logic for every collection.

2. Main Requirement
The system must support:

Multiple MongoDB collections.
Parent-child relationships between entities.
Configurable activation conditions.
Automatic activation when conditions become satisfied.
Automatic deactivation when conditions stop being satisfied.
Cascading status changes from child → parent.
Transaction-safe state changes.
Generic workflow logic that does not depend on specific entity names.
Ability to add new workflows without rewriting the workflow engine.
Efficient status evaluation without recursively querying an entire hierarchy.
Recovery/reconciliation when counters become inconsistent.
3. Example Workflow
The initial workflow is:

Country
   │
   │ requires >= 1 active Region
   ▼
Region
   │
   │ requires >= 1 active District
   ▼
District
   │
   │ requires >= 1 active Suburb
   ▼
Suburb

The rules are:

Entity	Parent	Child	Activation condition
Country	None	Region	At least 1 active Region
Region	Country	District	At least 1 active District
District	Region	Suburb	At least 1 active Suburb
Suburb	District	None	Own business condition

4. Important Architectural Principle
The hierarchy and workflow should be treated as two separate concepts.

Hierarchy
The hierarchy answers:

Who is the parent of this entity?

Example:

Suburb → District → Region → Country

Workflow
The workflow answers:

What condition must be satisfied for this entity to become active?

Example:

Country:
    active Region count >= 1

Region:
    active District count >= 1

District:
    active Suburb count >= 1

Do not hard-code these concepts together.

This allows the same workflow engine to later support:

Company
   └── Department
          └── Team

or:

Category
   └── Product

without changing the engine itself.

5. Do We Need a Workflow Collection?
Not initially.

If developers control the workflow definitions, keep the workflow rules in TypeScript.

Recommended:

Workflow definitions
        ↓
     TypeScript

Current entity state
        ↓
     MongoDB

A MongoDB workflow_definitions collection should only be introduced if workflows need to be configured dynamically by administrators or business users.

For the initial implementation:

No workflow collection required.

6. Recommended Architecture
                         Admin API
                            │
                            ▼
                    Entity Service
                ┌───────────┴───────────┐
                │                       │
             Country                 Region
             Service                 Service
                │                       │
                └───────────┬───────────┘
                            ▼
                    Workflow Service
                            │
                            ▼
                    Workflow Engine
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
          Rules          Registry       Repository
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                         MongoDB
                            │
                            ▼
                          Events
                            │
                            ▼
                    Parent evaluation

7. MongoDB Data Model
Each workflow-enabled entity should maintain its current status and activation information.

Example Country:

{
  "_id": "country-id",
  "name": "India",
  "status": "ACTIVE",
  "activation": {
    "activeChildCount": 5
  }
}

Example Region:

{
  "_id": "region-id",
  "name": "Kerala",
  "countryId": "country-id",
  "status": "ACTIVE",
  "activation": {
    "activeChildCount": 14
  }
}

Example District:

{
  "_id": "district-id",
  "name": "Ernakulam",
  "regionId": "region-id",
  "status": "ACTIVE",
  "activation": {
    "activeChildCount": 8
  }
}

Example Suburb:

{
  "_id": "suburb-id",
  "name": "Kakkanad",
  "districtId": "district-id",
  "status": "ACTIVE"
}

8. Why Use activeChildCount?
Do not recursively query all children every time an entity's status needs to be checked.

Avoid:

Country
  → query Regions
      → query Districts
          → query Suburbs

Instead maintain:

{
  "activation": {
    "activeChildCount": 5
  }
}

Then activation can be evaluated using:

activeChildCount >= requiredActiveChildren

For example:

activeChildCount = 5
required = 1

5 >= 1

Therefore:
ACTIVE

This makes status evaluation very cheap.

9. TypeScript Types
Create generic workflow types.

export type EntityStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface WorkflowEntity {
  id: string;
  type: string;
  status: EntityStatus;

  parent?: {
    type: string;
    id: string;
  };

  activation?: {
    activeChildCount: number;
  };
}

10. Workflow Condition
Create a generic condition interface.

export type ConditionOperator =
  | "GTE"
  | "GT"
  | "EQ"
  | "LTE"
  | "LT";

export interface ActiveChildCountCondition {
  type: "ACTIVE_CHILD_COUNT";
  operator: ConditionOperator;
  value: number;
}

Example:

const condition: ActiveChildCountCondition = {
  type: "ACTIVE_CHILD_COUNT",
  operator: "GTE",
  value: 1
};

This means:

active child count >= 1

11. Workflow Definition
Define workflows independently from the entity implementation.

export interface WorkflowRule {
  entityType: string;
  childType?: string;
  condition?: ActiveChildCountCondition;
}

Example:

const locationWorkflow: WorkflowRule[] = [
  {
    entityType: "country",
    childType: "region",
    condition: {
      type: "ACTIVE_CHILD_COUNT",
      operator: "GTE",
      value: 1
    }
  },

  {
    entityType: "region",
    childType: "district",
    condition: {
      type: "ACTIVE_CHILD_COUNT",
      operator: "GTE",
      value: 1
    }
  },

  {
    entityType: "district",
    childType: "suburb",
    condition: {
      type: "ACTIVE_CHILD_COUNT",
      operator: "GTE",
      value: 1
    }
  }
];

12. Workflow Registry
Create a registry that maps entity types to their workflow definitions.

export class WorkflowRegistry {
  private rules = new Map<string, WorkflowRule>();

  register(rule: WorkflowRule) {
    this.rules.set(rule.entityType, rule);
  }

  getRule(entityType: string) {
    return this.rules.get(entityType);
  }
}

Registration:

registry.register({
  entityType: "country",
  childType: "region",
  condition: {
    type: "ACTIVE_CHILD_COUNT",
    operator: "GTE",
    value: 1
  }
});

registry.register({
  entityType: "region",
  childType: "district",
  condition: {
    type: "ACTIVE_CHILD_COUNT",
    operator: "GTE",
    value: 1
  }
});

registry.register({
  entityType: "district",
  childType: "suburb",
  condition: {
    type: "ACTIVE_CHILD_COUNT",
    operator: "GTE",
    value: 1
  }
});

13. Workflow Engine
The workflow engine is responsible for evaluating conditions and changing entity state.

Conceptually:

class WorkflowEngine {
  async evaluate(entity: WorkflowEntity) {
    // 1. Get workflow rule

    // 2. Evaluate condition

    // 3. Determine expected status

    // 4. Change status if required

    // 5. Notify parent if status changed
  }
}

The engine must not contain logic such as:

if (entity.type === "country") {
   ...
}

if (entity.type === "region") {
   ...
}

Entity-specific business logic should remain in the configuration/adapter layer.

14. State Transition
All status changes should pass through one controlled function.

Example:

changeStatus({
  entityType: "suburb",
  entityId: suburbId,
  newStatus: "ACTIVE"
});

The state transition service should:

Load the current entity.
Check current status.
Do nothing if the status is already the requested status.
Update the entity status.
Update the parent's active-child count.
Evaluate the parent.
Continue propagation if the parent's status changes.
15. Important State Transition Rules
Only these transitions should modify parent counters:

INACTIVE → ACTIVE

Increment:

parent.activeChildCount += 1

And:

ACTIVE → INACTIVE

Decrement:

parent.activeChildCount -= 1

Do not change the counter for:

ACTIVE → ACTIVE

or:

INACTIVE → INACTIVE

Otherwise counters can become incorrect.

16. Cascading Activation Example
Initial state:

Country   INACTIVE
Region    INACTIVE
District  INACTIVE
Suburb    INACTIVE

Admin activates a Suburb:

Suburb ACTIVE

The District counter changes:

District.activeChildCount = 1

District condition:

activeChildCount >= 1

Therefore:

District ACTIVE

The Region counter changes:

Region.activeChildCount = 1

Therefore:

Region ACTIVE

The Country counter changes:

Country.activeChildCount = 1

Therefore:

Country ACTIVE

Final state:

Country   ACTIVE
   ↓
Region    ACTIVE
   ↓
District  ACTIVE
   ↓
Suburb    ACTIVE

17. Cascading Deactivation
The same mechanism must work in reverse.

Suppose:

Country   ACTIVE
Region    ACTIVE
District  ACTIVE
Suburb    ACTIVE

The only active Suburb becomes inactive.

Then:

Suburb ACTIVE → INACTIVE

District:

activeChildCount: 1 → 0

District condition fails:

0 >= 1

Therefore:

District ACTIVE → INACTIVE

Then Region:

activeChildCount: 1 → 0

Therefore:

Region ACTIVE → INACTIVE

Then Country:

activeChildCount: 1 → 0

Therefore:

Country ACTIVE → INACTIVE

Final state:

Country   INACTIVE
   ↓
Region    INACTIVE
   ↓
District  INACTIVE
   ↓
Suburb    INACTIVE

18. MongoDB Transactions
Status changes and counter changes should be performed atomically.

Example:

const session = await mongoose.startSession();

await session.withTransaction(async () => {

  // Update entity status

  // Update parent activeChildCount

  // Persist workflow event
});

This prevents situations where:

Child status = ACTIVE

but:

Parent activeChildCount was not incremented

19. Avoid Direct Status Updates
Do not allow application code to freely do:

await Suburb.updateOne(
  { _id: suburbId },
  {
    $set: {
      status: "ACTIVE"
    }
  }
);

because this bypasses:

Parent counter updates.
Parent activation.
Parent deactivation.
Workflow validation.
Events.
Instead:

await workflowService.changeStatus({
  entityType: "suburb",
  entityId: suburbId,
  newStatus: "ACTIVE"
});

All workflow-related status changes should go through the same service.

20. Event-Based Propagation
A status change can produce an event:

interface EntityStatusChangedEvent {
  type: "ENTITY_STATUS_CHANGED";

  entityType: string;
  entityId: string;

  previousStatus: EntityStatus;
  newStatus: EntityStatus;
}

Example:

{
  "type": "ENTITY_STATUS_CHANGED",
  "entityType": "suburb",
  "entityId": "123",
  "previousStatus": "INACTIVE",
  "newStatus": "ACTIVE"
}

The workflow engine processes the event.

Suburb ACTIVE
      ↓
ENTITY_STATUS_CHANGED
      ↓
Update District counter
      ↓
Evaluate District
      ↓
District ACTIVE
      ↓
ENTITY_STATUS_CHANGED
      ↓
Update Region counter
      ↓
Evaluate Region
      ↓
Region ACTIVE
      ↓
...

21. Event Infrastructure
For a small application, this can initially be implemented using an internal service:

workflowService.changeStatus(...)

As the application grows, introduce an event system.

Possible technologies:

MongoDB change streams.
Redis/BullMQ.
RabbitMQ.
Kafka.
An application-level event bus.
The exact technology is not important to the workflow design.

The important concept is:

State change
     ↓
Event
     ↓
Workflow evaluation
     ↓
Parent state change
     ↓
Another event

22. Outbox Pattern
If external event processing is introduced, consider an outbox collection.

Example:

workflow_outbox

Document:

{
  "_id": "...",
  "eventType": "ENTITY_STATUS_CHANGED",
  "payload": {
    "entityType": "suburb",
    "entityId": "...",
    "previousStatus": "INACTIVE",
    "newStatus": "ACTIVE"
  },
  "status": "PENDING",
  "createdAt": "..."
}

The entity update and outbox insert can be performed in the same MongoDB transaction.

This prevents:

Database updated
but event lost

23. Repository/Adapter Layer
The workflow engine should not directly depend on individual Mongoose models.

Avoid:

if (entityType === "country") {
  CountryModel...
}

if (entityType === "region") {
  RegionModel...
}

if (entityType === "district") {
  DistrictModel...
}

Instead define a generic interface.

interface WorkflowRepository {
  getById(
    entityType: string,
    entityId: string
  ): Promise<WorkflowEntity | null>;

  updateStatus(
    entityType: string,
    entityId: string,
    status: EntityStatus
  ): Promise<void>;

  incrementActiveChildCount(
    entityType: string,
    entityId: string,
    amount: number
  ): Promise<void>;

  getParent(
    entity: WorkflowEntity
  ): Promise<WorkflowEntity | null>;
}

Each entity can have an adapter behind this interface.

24. Workflow Registry + Repository Registry
The architecture can have two registries.

Workflow Registry
Responsible for:

What is the activation rule?

Example:

country → requires active region
region → requires active district
district → requires active suburb

Repository Registry
Responsible for:

How do I access this entity?

Example:

country → CountryRepository
region → RegionRepository
district → DistrictRepository
suburb → SuburbRepository

This separation keeps the workflow engine generic.

25. Future Conditions
The initial condition can be:

ACTIVE_CHILD_COUNT >= N

But the system should be designed so additional conditions can be added later.

Examples:

Minimum active children
{
  "type": "ACTIVE_CHILD_COUNT",
  "operator": "GTE",
  "value": 1
}

All children active
{
  "type": "ACTIVE_CHILD_RATIO",
  "operator": "EQ",
  "value": 1
}

Percentage of children
{
  "type": "ACTIVE_CHILD_RATIO",
  "operator": "GTE",
  "value": 0.8
}

Field condition
{
  "type": "FIELD",
  "field": "approved",
  "operator": "EQ",
  "value": true
}

Multiple conditions
{
  "type": "AND",
  "conditions": [
    {
      "type": "ACTIVE_CHILD_COUNT",
      "operator": "GTE",
      "value": 1
    },
    {
      "type": "FIELD",
      "field": "approved",
      "operator": "EQ",
      "value": true
    }
  ]
}

26. Example Future Workflow
The same engine could support:

Company
   ↓
Department
   ↓
Team

Rules:

Company:
    at least 1 active Department

Department:
    at least 2 active Teams

No workflow engine changes should be necessary.

Only the workflow configuration changes:

{
  entityType: "department",
  childType: "team",
  condition: {
    type: "ACTIVE_CHILD_COUNT",
    operator: "GTE",
    value: 2
  }
}

27. Folder Structure
Recommended structure:

src/
│
├── modules/
│   ├── country/
│   │   ├── country.model.ts
│   │   ├── country.repository.ts
│   │   └── country.service.ts
│   │
│   ├── region/
│   ├── district/
│   └── suburb/
│
├── workflow/
│   ├── workflow.engine.ts
│   ├── workflow.service.ts
│   ├── workflow.registry.ts
│   ├── workflow.rules.ts
│   ├── workflow.types.ts
│   ├── workflow.repository.ts
│   ├── workflow.events.ts
│   └── workflow.errors.ts
│
├── infrastructure/
│   ├── mongodb/
│   └── events/
│
└── jobs/
    └── workflow-reconciliation.job.ts

28. Implementation Steps
Phase 1 — Define the common state model
Add:

status
activation.activeChildCount

to workflow-enabled entities.

Phase 2 — Define workflow types
Create:

workflow.types.ts

Define:

EntityStatus
WorkflowEntity
WorkflowRule
WorkflowCondition

Phase 3 — Create workflow configuration
Create:

workflow.rules.ts

Define the Country → Region → District → Suburb rules.

Phase 4 — Create Workflow Registry
Create:

workflow.registry.ts

Responsibilities:

Register workflow rules.
Retrieve rules by entity type.
Validate workflow configuration.
Phase 5 — Create Repository abstraction
Create:

workflow.repository.ts

Responsibilities:

Load entities.
Find parents.
Update status.
Increment/decrement counters.
Phase 6 — Create Condition Evaluator
Implement:

evaluateCondition(
  condition,
  entity
)

Initially support:

ACTIVE_CHILD_COUNT

with:

GTE
GT
EQ
LTE
LT

Phase 7 — Create State Transition Service
Implement:

changeStatus(...)

Responsibilities:

Load current entity.
Check current status.
Update status.
Update parent counter.
Evaluate parent.
Propagate if necessary.
Phase 8 — Add MongoDB Transactions
Wrap state changes and counter updates inside:

session.withTransaction(...)

Phase 9 — Add Events
Create:

ENTITY_STATUS_CHANGED

Use events to propagate state changes.

Phase 10 — Add Outbox
If asynchronous processing is required, create:

workflow_outbox

and process pending events.

Phase 11 — Add Reconciliation
Create a scheduled job that verifies:

stored activeChildCount

against:

actual number of active children

Example:

Stored:
activeChildCount = 5

Actual:
active children = 4

Repair:
activeChildCount = 4

The reconciliation process should also re-evaluate affected parent statuses.

29. Required MongoDB Indexes
For the example hierarchy, create indexes on parent references and status.

Examples:

RegionSchema.index({
  countryId: 1,
  status: 1
});

DistrictSchema.index({
  regionId: 1,
  status: 1
});

SuburbSchema.index({
  districtId: 1,
  status: 1
});

These indexes are particularly useful for reconciliation and validation queries.

30. Important Concurrency Consideration
Multiple administrators may modify children at the same time.

For example:

Admin A activates Suburb A
Admin B activates Suburb B

Both could attempt:

District.activeChildCount += 1

MongoDB's atomic $inc operation should be used for counters:

{
  $inc: {
    "activation.activeChildCount": 1
  }
}

Do not implement counters using:

const entity = await findById(id);

entity.activation.activeChildCount++;

await entity.save();

without considering concurrent updates.

Prefer atomic operations or transactions.

31. Idempotency
Workflow operations should be idempotent.

Calling:

changeStatus(
  suburbId,
  "ACTIVE"
);

twice should not produce:

activeChildCount += 2

It must result in:

activeChildCount += 1

only once.

Therefore:

INACTIVE → ACTIVE

produces an increment.

But:

ACTIVE → ACTIVE

produces nothing.

32. Deletion Handling
Deletion must also go through the workflow system.

If an active child is deleted:

ACTIVE child
     ↓
DELETE

the parent counter must be decremented.

Therefore, before deleting a workflow-enabled entity, determine whether it is currently active.

If:

child.status === ACTIVE

then:

parent.activeChildCount--

and the parent must be re-evaluated.

Prefer soft deletion if the business requirements allow it:

{
  "deletedAt": "..."
}

This makes auditing and reconciliation easier.

33. Activation vs Manual Approval
A future requirement may distinguish:

MANUALLY_APPROVED

from:

EFFECTIVELY_ACTIVE

For example:

Admin approves Suburb
        ↓
Suburb eligible for activation
        ↓
Workflow conditions evaluated
        ↓
Suburb ACTIVE

If such a requirement appears, do not overload the single status field.

Consider:

approvalStatus
workflowStatus

or another explicit state model.

This prevents confusion between:

"Admin approved this entity"

and:

"This entity is currently active according to the hierarchy"

34. Testing Requirements
The workflow engine must have unit and integration tests.

Basic activation
Test:

Suburb becomes active
→ District becomes active

Full cascade
Test:

Suburb ACTIVE
→ District ACTIVE
→ Region ACTIVE
→ Country ACTIVE

Deactivation
Test:

Suburb INACTIVE
→ District INACTIVE
→ Region INACTIVE
→ Country INACTIVE

Multiple children
Example:

District
  ├── Suburb A ACTIVE
  └── Suburb B ACTIVE

Deactivate Suburb A:

activeChildCount: 2 → 1

District should remain:

ACTIVE

Deactivate Suburb B:

activeChildCount: 1 → 0

District should become:

INACTIVE

Idempotency
Calling activation twice must not increment the counter twice.

Concurrent updates
Test multiple children becoming active concurrently.

Transaction rollback
If part of the operation fails, verify that:

child status

and:

parent counter

are not left inconsistent.

Reconciliation
Create an intentionally incorrect counter and verify that the reconciliation job fixes it.

35. Final Recommended Design
The overall design should be:

                  WORKFLOW DEFINITIONS
                         │
                         ▼
                  Workflow Registry
                         │
                         ▼
Admin ──→ Entity Service ──→ Workflow Service
                               │
                               ▼
                        Workflow Engine
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
             Rules        Repository        Events
                │              │              │
                └──────────────┼──────────────┘
                               ▼
                            MongoDB
                               │
                               ▼
                       Reconciliation Job

The key principle is:

Workflow rules = configuration/code

Entity status = MongoDB

Activation counters = MongoDB

State transitions = Workflow Service

Propagation = Workflow Engine / Events

Consistency = MongoDB Transactions + Reconciliation

36. Definition of Done
The implementation is considered complete when:

 Country → Region → District → Suburb workflow works.
 Activation propagates upward.
 Deactivation propagates upward.
 Multiple active children are handled correctly.
 Counters are updated atomically.
 Repeated activation is idempotent.
 Direct workflow status updates are prevented.
 MongoDB transactions are used where required.
 Workflow rules are separated from entity implementations.
 New entity types can be added without modifying the core workflow engine.
 New activation conditions can be added through condition implementations.
 Required MongoDB indexes are created.
 Reconciliation is implemented.
 Unit tests cover the workflow engine.
 Integration tests cover MongoDB transactions and cascading changes.
 Logging/auditing exists for important state transitions.
37. Summary
The system should not implement activation logic independently inside Country, Region, District, Suburb, etc.

Instead, create one generic workflow engine.

The engine receives:

Entity
+
Workflow Rule
+
Current State

and determines:

Should this entity be ACTIVE or INACTIVE?

When the state changes:

Child state changes
        ↓
Parent counter changes
        ↓
Parent condition evaluated
        ↓
Parent state changes
        ↓
Next parent evaluated

For the initial implementation, a separate workflow MongoDB collection is not required.

Keep workflow definitions in TypeScript and keep runtime state/counters in the existing MongoDB collections.

This provides a generic foundation that can later support much more complex workflows without coupling the workflow engine to Country, Region, District, Suburb, or any other specific collection.

If you want, the next step should be turning this specification into the actual Mongoose + TypeScript implementation, starting with workflow.types.ts, workflow.registry.ts, workflow.engine.ts, and the transaction-safe changeStatus() flow.