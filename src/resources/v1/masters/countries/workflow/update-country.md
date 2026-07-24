# Update Country Workflow

**Title:** Update Country Details

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router PUT /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E{validationMiddleware}
    E -- Invalid Payload --> D
    E -- Valid Payload --> F(Update controller method)
    F --> G(updateCountryService.execute)
    G --> H[Start Mongoose Session & Transaction]
    H --> I(Find country by ID)
    I -- Not found --> J[Abort Transaction / Return Error]
    I -- Found --> K[Check for name/ISO conflicts in other countries]
    K -- Conflict found --> J
    K -- Clean updates --> L[Apply updates using snapshot changes comparison]
    L --> M(createDbTransaction log)
    M --> N[Commit Transaction]
    N --> O[200 OK + Updated Country details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in path (valid MongoDB ObjectId)
- **Optional/Required Fields:**
  - Updatable fields: `name`, `iso_code`, `iso_code_3`, `phone_code`

## **Validation & Error Handling**

- If country is not found -> `country_not_found`
- If modified fields conflict with existing records -> `country_already_exists`

## **Transaction & Consistency**

- Runs inside a Mongoose session.
- Database changes are rolled back on any validation/duplication check failure.
- Commits changes on success, records snapshots differences in transactional audit trail.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"country_updated"`
- Data: Updated country document details

### **Error Response:**
- Code: `400 Bad Request` / `409 Conflict` / `404 Not Found`
