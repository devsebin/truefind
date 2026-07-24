# Deactivate Country Workflow

**Title:** Disable/Deactivate Country Record

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router PATCH /:id/disable)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E(deactivate controller method)
    E --> F(disableCountryService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H(Find Country by ID)
    H -- Not found --> I[Abort Transaction / Return Error]
    H -- Found --> J[Set is_active = false]
    J --> K(createDbTransaction log)
    K --> L[Commit Transaction]
    L --> M[200 OK + Deactivated country details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in path (valid MongoDB ObjectId)

## **Validation & Error Handling**

- If country is not found -> `country_not_found`

## **Transaction & Consistency**

- Runs inside a transactional session.
- Logs update transaction log upon success.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"country_deactivated"`
- Data: Updated country details (`is_active: false`)

### **Error Response:**
- Code: `400 Bad Request` / `404 Not Found`
