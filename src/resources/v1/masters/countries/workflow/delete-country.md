# Delete Country Workflow

**Title:** Soft/Force Delete Country

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router DELETE /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E(Delete controller method)
    E --> F(deleteCountryService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H[Check if Country has dependent records in other collections]
    H -- Has dependencies & not force_action --> I[Abort Transaction / Return dependency error]
    H -- No dependencies OR force_action = true --> J[Perform Delete operation]
    J --> K{Is force delete requested?}
    K -- Yes --> L[Hard delete from database]
    K -- No --> M[Soft delete: set is_deleted = true, deleted_at = now]
    L --> N(createDbTransaction log)
    M --> N
    N --> O[Commit Transaction]
    O --> P[200 OK + Deletion confirmation]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in path (valid MongoDB ObjectId)
- **Optional Query parameters:**
  - `force_action` (Boolean: if true, allows force/hard deletion)

## **Validation & Error Handling**

- If country ID is invalid -> `invalid_id`
- If country does not exist -> `country_not_found`
- If has relational dependencies (e.g. states, regions, districts, providers) and `force_action` is false -> returns validation error mapping dependencies

## **Transaction & Consistency**

- Deletion steps execute inside a transactional session.
- Database changes are rolled back on dependency constraints violation.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"country_deleted"`
- Data: Deleted country document details

### **Error Response:**
- Code: `400 Bad Request` / `409 Conflict` / `404 Not Found`
