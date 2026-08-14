# Service Availability by User Region — Implementation Specification

## Objective

Implement a new `users/services` API that returns the services available to the authenticated user based on the user's location.

The service hierarchy is stored in the `services` collection, while service availability and configuration per suburb are stored in the `service_area_configurations` collection.

The API must:

1. Identify the authenticated user.
2. Get the user's `region_id` and `suburb_id`.
3. Determine which services are available in the user's location.
4. Return the services from the `services` collection.
5. Preserve the service hierarchy and populate children recursively.
6. Remove services/children that are not available.
7. Return the applicable service-area configuration.
8. Avoid returning empty parent categories.
9. Maintain existing project architecture, naming conventions, error handling, validation, and response format.

---

## Existing Collections

### 1. Users

Important location fields:

```ts
region_id?: Types.ObjectId | null;
suburb_id?: Types.ObjectId | null;
```

### 2. Services

The service hierarchy is represented by child service IDs:

```ts
export interface IBaseServiceDocument
  extends CommonServiceFieldsInterface,
    Document {
  name: string;
  type: string;
  description: string;
  is_active: boolean;
  is_deleted: boolean;
  icon: Types.ObjectId;
  children: Types.ObjectId[];
}
```

The hierarchy can contain multiple levels.

Example:

```text
Home Services
 ├── Plumbing
 │    ├── Bathroom Plumbing
 │    └── Kitchen Plumbing
 │
 └── Electrical
      ├── Wiring
      └── Lighting
```

### 3. Service Area Configuration

```ts
export interface IServiceAreaConfigurationDocument
  extends CommonServiceFieldsInterface,
    Document {
  service_id: Types.ObjectId;
  suburb_id: Types.ObjectId;

  required_licenses?: boolean;

  is_callout_service?: boolean;
  is_fixed_price?: boolean;

  price?: number;
  unit_id?: Types.ObjectId;

  minimum_unit_price?: number;
  maximum_unit_price?: number;

  call_out_fee?: number;

  estimated_time?: number;
  estimated_time_unit?: timeUnits;
}
```

This collection determines whether a service is available in a suburb and contains the configuration for that service in that suburb.

---

# API Requirement

Implement:

```text
GET /users/services
```

Use the existing authenticated-user mechanism to identify the user.

Do not accept `user_id`, `region_id`, or `suburb_id` from the request unless the existing architecture specifically requires it.

The authenticated user should be the source of location information.

---

# Location Resolution

Use this priority:

```text
User suburb_id
    ↓
Use exact suburb configuration
```

If `suburb_id` is unavailable:

```text
User region_id
    ↓
Find all suburbs belonging to region
    ↓
Find available services across those suburbs
```

If neither `suburb_id` nor `region_id` exists, return an empty service list.

Do not throw an error merely because the user does not have a location.

---

# Exact Suburb Behaviour

If the user has a `suburb_id`, use that suburb as the primary service-area lookup.

Example:

```text
User
  region_id = Region A
  suburb_id = Suburb B

Service Area Configuration
  Plumbing + Suburb A
  Plumbing + Suburb B
  Electrical + Suburb C
```

The user should receive Plumbing but not Electrical.

The returned Plumbing service should contain the configuration for Suburb B.

---

# Region Fallback Behaviour

If the user does not have a `suburb_id`, but has a `region_id`, find all active suburbs belonging to that region.

Example:

```text
Region A
 ├── Suburb A
 ├── Suburb B
 └── Suburb C
```

Service configurations:

```text
Plumbing + Suburb A
Electrical + Suburb B
Cleaning + Suburb C
```

Return the available services:

```text
Plumbing
Electrical
Cleaning
```

When multiple configurations exist for the same service across different suburbs, do not arbitrarily choose one configuration.

Preferred behaviour:

- Exact suburb lookup: return the exact suburb configuration.
- Region fallback: return service availability. Do not return a random suburb's configuration.
- Only introduce aggregated region-level configuration if explicitly supported by the business requirements.

---

# Service Tree Filtering

The service tree must be filtered recursively.

Full tree:

```text
Home Services
 ├── Plumbing
 │    ├── Bathroom Plumbing
 │    └── Kitchen Plumbing
 │
 └── Electrical
      ├── Wiring
      └── Lighting
```

Suppose the user's suburb has:

```text
Bathroom Plumbing
Wiring
```

available.

Return:

```text
Home Services
 ├── Plumbing
 │    └── Bathroom Plumbing
 │
 └── Electrical
      └── Wiring
```

Do not return unavailable children.

---

# Parent Service Behaviour

A parent service remains in the result if:

- the parent itself is directly available, OR
- at least one descendant is available.

Example:

```text
Plumbing
 ├── Bathroom Plumbing       AVAILABLE
 └── Kitchen Plumbing        NOT AVAILABLE
```

Result:

```text
Plumbing
 └── Bathroom Plumbing
```

If neither child is available and the parent itself is not available, remove the parent completely.

---

# Service Availability

A service is directly available when there is an active service-area configuration matching:

```text
service_area_configurations.service_id = services._id
```

and:

```text
is_active = true
is_deleted = false
```

The service itself must also satisfy:

```text
is_active = true
is_deleted = false
```

---

# Service Configuration in Response

For exact suburb lookup, include the applicable service-area configuration.

Example:

```json
{
  "_id": "service-id",
  "name": "Bathroom Plumbing",
  "type": "service",
  "description": "Bathroom plumbing services",
  "icon": "icon-id",
  "estimated_time": 2,
  "estimated_time_unit": "hours",
  "children": [],
  "configuration": {
    "required_licenses": true,
    "is_callout_service": true,
    "is_fixed_price": true,
    "price": 150,
    "unit_id": "unit-id",
    "minimum_unit_price": 100,
    "maximum_unit_price": 200,
    "call_out_fee": 20,
    "estimated_time": 2,
    "estimated_time_unit": "hours",
    "is_active": true
  }
}
```

Follow existing project DTO/serializer conventions.

Do not expose unnecessary internal database fields.

---

# Recommended Database Indexes

Add/verify:

```ts
ServiceAreaConfigurationSchema.index(
  {
    service_id: 1,
    suburb_id: 1,
  },
  {
    unique: true,
  }
);
```

Also add:

```ts
ServiceAreaConfigurationSchema.index({
  suburb_id: 1,
  service_id: 1,
});
```

For suburbs:

```ts
SuburbSchema.index({
  region_id: 1,
});
```

The unique index prevents duplicate configurations for the same `service_id + suburb_id`.

---

# Recommended Implementation Approach

Do not perform a database query for every service or every child.

Avoid N+1 queries.

Recommended flow:

```text
1. Get authenticated user
        ↓
2. Get user suburb_id / region_id
        ↓
3. Determine target suburb IDs
        ↓
4. Query service_area_configurations
        ↓
5. Build Set<service_id> of available services
        ↓
6. Query active services
        ↓
7. Build service lookup Map
        ↓
8. Recursively build service hierarchy
        ↓
9. Remove unavailable services
        ↓
10. Attach exact suburb configuration
        ↓
11. Return service tree
```

Expected database access should be approximately:

```text
1 query → user
1 query → suburbs, only when region fallback is required
1 query → service area configurations
1 query → services
```

---

# Suggested Service Method

Put the business logic in the appropriate service layer, for example:

```ts
getUserServices(userId: Types.ObjectId)
```

Keep the controller thin and follow the project's existing architecture.

---

# Suggested Algorithm

```ts
async function getUserServices(userId: Types.ObjectId) {

  const user = await UserModel.findById(userId)
    .select("region_id suburb_id")
    .lean();

  if (!user) {
    throw userNotFoundError;
  }

  let suburbIds: Types.ObjectId[] = [];

  if (user.suburb_id) {
    suburbIds = [user.suburb_id];
  } else if (user.region_id) {

    const suburbs = await SuburbModel.find({
      region_id: user.region_id,
      is_active: true,
      is_deleted: false,
    })
      .select("_id")
      .lean();

    suburbIds = suburbs.map(suburb => suburb._id);
  }

  if (!suburbIds.length) {
    return [];
  }

  const serviceAreas =
    await ServiceAreaConfigurationModel.find({
      suburb_id: { $in: suburbIds },
      is_active: true,
      is_deleted: false,
    })
      .lean();

  if (!serviceAreas.length) {
    return [];
  }

  const availableServiceIds = new Set(
    serviceAreas.map(item => item.service_id.toString())
  );

  const services = await ServiceModel.find({
    is_active: true,
    is_deleted: false,
  })
    .lean();

  const serviceMap = new Map(
    services.map(service => [
      service._id.toString(),
      service,
    ])
  );

  function buildServiceTree(
    serviceId: string,
    visited = new Set<string>()
  ) {

    if (visited.has(serviceId)) {
      return null;
    }

    const service = serviceMap.get(serviceId);

    if (!service) {
      return null;
    }

    const nextVisited = new Set(visited);
    nextVisited.add(serviceId);

    const children = (service.children ?? [])
      .map(childId =>
        buildServiceTree(
          childId.toString(),
          nextVisited
        )
      )
      .filter(Boolean);

    const directlyAvailable =
      availableServiceIds.has(serviceId);

    if (!directlyAvailable && children.length === 0) {
      return null;
    }

    return {
      ...service,
      children,
    };
  }

  // Determine root services according to the existing serviceTypes
  // and existing service hierarchy implementation.

  const rootServices = services.filter(
    service => /* existing root-service condition */
  );

  return rootServices
    .map(service =>
      buildServiceTree(service._id.toString())
    )
    .filter(Boolean);
}
```

Do not blindly assume that `serviceTypes.Category` is always the root. Inspect the existing service model and `serviceTypes` before implementing this part.

---

# Important Service Interface Check

If the database stores child IDs, the TypeScript interface should be:

```ts
children: Types.ObjectId[];
```

Do not use:

```ts
children: IBaseServiceDocument[];
```

unless the actual database field contains populated documents.

---

# Edge Cases

Handle all of the following:

1. User does not exist → existing user-not-found error.
2. User has no suburb and no region → empty list.
3. User's suburb has no configurations → empty list.
4. User's region has no suburbs → empty list.
5. Service unavailable → omit it.
6. Service inactive → omit it.
7. Service deleted → omit it.
8. Service-area configuration inactive → omit it.
9. Service-area configuration deleted → omit it.
10. Parent unavailable but child available → keep parent with available child.
11. Parent unavailable and all children unavailable → remove parent.
12. Multiple levels of children → filter recursively.
13. Circular service hierarchy → prevent infinite recursion using a visited Set.
14. Duplicate service-area configuration → prevent through unique index.
15. Different configuration values between suburbs → exact suburb must use its own configuration.

---

# Existing Bulk Override Compatibility

Do not break the existing bulk override API.

Each suburb must support independent configuration values.

Expected structure:

```json
{
  "suburbs": [
    {
      "suburb_id": "suburb-1",
      "price": 100,
      "is_fixed_price": true
    },
    {
      "suburb_id": "suburb-2",
      "price": 150,
      "is_fixed_price": true
    }
  ]
}
```

---

# Testing Requirements

Add unit/integration tests for:

1. User with valid suburb.
2. User with valid region but no suburb.
3. User without region/suburb.
4. Service available in user's suburb.
5. Service unavailable in user's suburb.
6. Parent retained when child is available.
7. Parent removed when all children are unavailable.
8. Multiple levels of service children.
9. Inactive service.
10. Deleted service.
11. Inactive service-area configuration.
12. Deleted service-area configuration.
13. Different configurations for different suburbs.
14. Exact suburb configuration takes priority.
15. Region fallback does not return a random suburb configuration.
16. Circular service hierarchy does not cause infinite recursion.
17. Duplicate service-area configuration is prevented by the unique index.

---

# Acceptance Criteria

The implementation is complete when:

- `GET /users/services` is implemented.
- Authenticated user's location is used.
- `suburb_id` is preferred over `region_id`.
- `region_id` is used as fallback.
- Only active, non-deleted services are returned.
- Only available services are returned.
- Children are populated recursively.
- Unavailable children are removed.
- Empty parent categories are removed.
- Available descendants preserve their parent hierarchy.
- Exact suburb configuration is returned with the service.
- No N+1 database queries are introduced.
- Circular service relationships cannot cause infinite recursion.
- Required indexes exist.
- Existing response/error conventions are preserved.
- Existing tests continue passing.
- New tests cover the required availability scenarios.

---

# Final Instruction to Antigravity

Inspect the existing project structure before making changes.

Identify:

- Existing user controller/service patterns.
- Existing service controller/service patterns.
- Existing authentication/user ID extraction.
- Existing `ServiceModel`.
- Existing `SuburbModel`.
- Existing `ServiceAreaConfigurationModel`.
- Existing `serviceTypes`.
- Existing API response format.
- Existing error handling.
- Existing validation conventions.
- Existing route naming conventions.
- Existing tests.

Then implement the feature using the project's existing conventions rather than introducing a parallel architecture.

Do not make unrelated refactors.

Keep the implementation focused on `GET /users/services` and the required service availability logic.
