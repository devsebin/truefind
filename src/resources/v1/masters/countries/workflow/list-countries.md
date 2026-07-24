# List Countries Workflow

**Title:** List Countries with Pagination and Filtering

## **Workflow Diagram**

```mermaid
flowchart TD
    A[Client Request] --> B(Express Router GET /)
    B --> C(Index controller method)
    C --> D(listCountryService.execute)
    D --> E[Start Mongoose Session & Transaction]
    E --> F[Parse query params: page, limit, order_by, fields, populate]
    F --> G(buildWhereClause)
    G --> H[Fetch countries & count total documents in Promise.all]
    H --> I(createDbTransaction log)
    I --> J[Commit Transaction]
    J --> K[200 OK + Paginated list of countries]
```

## **Acceptance Criteria**

- **Optional Query Parameters:**
  - `page` (Number, default 1)
  - `limit` (Number, default 10)
  - `order_by` (String)
  - `order_direction` (String: `"asc"` or `"desc"`)
  - `fields` (Comma-separated columns select list)
  - `populate` (Relational fields to resolve)

## **Transaction & Consistency**

- Read operation executes within Mongoose session.
- Audits and records GET request as a Read transaction in database logs.

## **Response**

### **Success Response:**
- Code: `200 OK`
- Message: `"country_listed"`
- Data: Paginated array including pagination headers and list items

### **Error Response:**
- Code: `500 Internal Server Error`
