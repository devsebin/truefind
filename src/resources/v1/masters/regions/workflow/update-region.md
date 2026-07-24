# Update Region Workflow

**Title:** Update Region Details

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router PUT /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E{validationMiddleware}
    E -- Invalid Payload --> D
    E -- Valid Payload --> F(Update controller method)
    F --> G(updateRegionService.execute)
    G --> H[Start Mongoose Session & Transaction]
    H --> I(Find region by ID)
    I -- Not found --> J[Abort Transaction / Return Error]
    I -- Found --> K[Check for conflicts in other regions]
    K -- Conflict found --> J
    K -- Clean updates --> L[Apply updates using snapshot changes comparison]
    L --> M(createDbTransaction log)
    M --> N[Commit Transaction]
    N --> O[200 OK + Updated Region details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in path (valid MongoDB ObjectId)
- **Required/Optional Fields:**
  - Updatable fields: `name`, `code`, `country_id`

## **Validation & Error Handling**

- If region is not found -> `region_not_found`
- If modified fields conflict with existing records -> `region_already_exists`
- Checks referenced `country_id` existence.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"region_updated"`
- Data: Updated region document details

### **Error Response:**
- Code: `400 Bad Request` / `409 Conflict` / `404 Not Found`
