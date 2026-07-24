# Update Status Workflow

**Title:** Update Status Details

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router PUT /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E{validationMiddleware}
    E -- Invalid Payload --> D
    E -- Valid Payload --> F(Update controller method)
    F --> G(updateStatusService.execute)
    G --> H[Start Mongoose Session & Transaction]
    H --> I(Find status by ID)
    I -- Not found --> J[Abort Transaction / Return Error]
    I -- Found --> K[Check for conflicts in other status records]
    K -- Conflict found --> J
    K -- Clean updates --> L[Apply updates using snapshot changes comparison]
    L --> M(createDbTransaction log)
    M --> N[Commit Transaction]
    N --> O[200 OK + Updated Status details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in path (valid MongoDB ObjectId)
- **Required/Optional Fields:**
  - Updatable fields: `title`, `color`

## **Validation & Error Handling**

- If status is not found -> `status_not_found`
- If modified fields conflict with existing records -> `status_already_exists`

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"status_updated"`
- Data: Updated status document details

### **Error Response:**
- Code: `400 Bad Request` / `409 Conflict` / `404 Not Found`
