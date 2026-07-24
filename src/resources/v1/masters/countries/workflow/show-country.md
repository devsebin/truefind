# Show Country Workflow

**Title:** Get Country Details by ID

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router GET /:id)
    B --> C{paramsValidator}
    C -- Invalid ID format --> D[400 Bad Request]
    C -- Valid ID --> E(Show controller method)
    E --> F(showCountryService.execute)
    F --> G[Start Mongoose Session & Transaction]
    G --> H[Query Country by ID]
    H -- Not found --> I[Abort Transaction / Return Error]
    H -- Found --> J(createDbTransaction log)
    J --> K[Commit Transaction]
    K --> L[200 OK + Country details]
```

## **Acceptance Criteria**

- **Required parameters:**
  - `id` in request path (valid MongoDB ObjectId)

## **Validation & Error Handling**

- If `id` format is invalid -> `invalid_id`
- If country does not exist -> `country_not_found`

## **Transaction & Consistency**

- Runs inside a transactional session.
- Commits on success and logs the GET Read event in activity logs.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"country_shown"`
- Data: Country document details

### **Error Response:**
- Code: `400 Bad Request` / `404 Not Found`
