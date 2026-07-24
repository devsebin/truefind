# Delete Status Workflow

**Title:** Soft/Force Delete Status Record

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router DELETE /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E(Delete controller method)
    E --> F(deleteStatusService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H[Check if Status has dependent records in other collections]
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
  - `force_action` (Boolean)

## **Validation & Error Handling**

- If status ID is invalid -> `invalid_id`
- If status does not exist -> `status_not_found`
- Relational dependencies check with all tables matching by status field.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"status_deleted"`
- Data: Deleted status document details

### **Error Response:**
- Code: `400 Bad Request` / `409 Conflict` / `404 Not Found`
