# User Story: List Declaimers

**Title:** As an Admin, I want to list declaimers with filtering, pagination, and sorting.

## **Acceptance Criteria**

When fetching declaimers:

### **Query Parameters (Optional):**

- page → must be a number (default: 1).
- limit → must be a number (default: 10).
- order_by → field name to sort by.
- order_direction → "asc" or "desc" (default: desc).
- fields → comma-separated list of fields to include.
- populate → related fields to populate.
- filters → dynamic filtering supported via query parameters.

## **Pagination**

- offset = limit × (page - 1)
- current_page → current requested page.
- rows_per_page → number of records per page.
- totalCount → total matching records.
- last_page → total pages (totalCount / limit).
- from → starting record index of current page.

## **Validation Rules**

- page and limit must be valid numbers.
- order_direction must be either **asc** or **desc**.
- fields must be a comma-separated string if provided.
- populate must reference valid relational fields.
- Any invalid query parameter may result in a validation error.

## **Filtering & Query Behavior**

- Dynamic filtering is applied using `buildWhereClause(request)`.
- Supports:
  - Exact match filters
  - Conditional filters (based on implementation of helper)
- Only matching declaimers are returned.

## **Sorting**

- Sorting is applied dynamically:
  - order_by → field name
  - order_direction → asc (1) or desc (-1)

## **Field Selection**

- If `fields` is provided:
  - Only specified fields are returned.
  - Example: `fields=title,language,country`

## **Population**

- If `populate` is provided:
  - Related documents are populated dynamically.

## **Transaction & Audit Trail**

- A **Mongoose session** is used for consistency.
- Even though it's a read operation:
  - Transaction is started and committed to maintain structure.

### **Audit Logging**

- Each request is recorded using `createDbTransaction`:
  - table: Declaimers
  - method: GET
  - operation: Read
  - payload: fetched declaimers
