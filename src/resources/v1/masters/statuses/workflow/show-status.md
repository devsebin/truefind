# Show Status Workflow

**Title:** Get Status Details by ID

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router GET /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E(Show controller method)
    E --> F(showStatusService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H[Query Status by ID]
    H -- Not found --> I[Abort Transaction / Return Error]
    H -- Found --> J(createDbTransaction log)
    J --> K[Commit Transaction]
    K --> L[200 OK + Status details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in request path (valid MongoDB ObjectId)

## **Validation & Error Handling**

- If `id` format is invalid -> `invalid_id`
- If status does not exist -> `status_not_found`

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"status_shown"`
- Data: Status document details

### **Error Response:**
- Code: `400 Bad Request` / `404 Not Found`
