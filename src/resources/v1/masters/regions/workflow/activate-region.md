# Activate Region Workflow

**Title:** Enable/Activate Region Record

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router PATCH /:id/enable)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E(activate controller method)
    E --> F(enableRegionService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H(Find Region by ID)
    H -- Not found --> I[Abort Transaction / Return Error]
    H -- Found --> J[Set is_active = true]
    J --> K(createDbTransaction log)
    K --> L[Commit Transaction]
    L --> M[200 OK + Activated region details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in path (valid MongoDB ObjectId)

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"region_activated"`
- Data: Updated region details (`is_active: true`)

### **Error Response:**
- Code: `400 Bad Request` / `404 Not Found`
