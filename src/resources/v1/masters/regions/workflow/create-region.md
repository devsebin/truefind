# Create Region Workflow

**Title:** Create a New Region Record

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router POST /)
    B --> C{validationMiddleware}
    C -- Invalid Payload --> D[400 Bad Request]
    C -- Valid Payload --> E(Store controller method)
    E --> F(createRegionService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H(findRegionHelperService)
    H -- Region with same name/code exists --> I[Abort Transaction / Return Error]
    H -- Unique details --> J(findCountryHelperService)
    J -- Country not found --> I
    J -- Country exists --> K(createRegionHelperService)
    K --> L[Insert Region document, set version & metadata]
    L --> M(createDbTransaction log)
    M --> N[Commit Transaction]
    N --> O[201 Created + Region Details]
```

## **Acceptance Criteria**

- **Required Fields:**
  - `name` (String, min 1, max 100)
  - `code` (String, min 1, max 10, unique code)
  - `country_id` (valid MongoDB ObjectId, country must exist)

## **Validation & Error Handling**

- If region code/name already exists -> `region_already_exists`
- If country does not exist -> `country_not_found`

## **Transaction & Consistency**

- Execution runs inside Mongoose session transaction.
- Rolls back on duplicate details or referenced country check failure.
- Logs create transaction on success.

## **Response**

### **Success Response:**
- Code: `201 Created`
- Message: `"region_created"`
- Data: Created region document details

### **Error Response:**
- Code: `400 Bad Request` / `409 Conflict` / `404 Not Found`
