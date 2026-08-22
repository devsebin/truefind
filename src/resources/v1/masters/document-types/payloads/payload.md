# Document Types JSON Payloads

Comprehensive JSON payload examples for all endpoints and validation scenarios in the **Document Types** master module.

---

## Table of Contents
- [1. Create Document Type (`POST /api/v1/masters/document-types`)](#1-create-document-type-post-apiv1mastersdocument-types)
  - [1.1. Full Payload (All fields)](#11-full-payload-all-fields)
  - [1.2. Minimum Required Payload](#12-minimum-required-payload)
  - [1.3. Explicit `is_default: false`](#13-explicit-is_default-false)
  - [1.4. Invalid Payloads (Error Cases)](#14-invalid-payloads-error-cases)
- [2. Update Document Type (`PUT /api/v1/masters/document-types/:id`)](#2-update-document-type-put-apiv1mastersdocument-typesid)
  - [2.1. Full Update Payload](#21-full-update-payload)
  - [2.2. Partial Updates (Single / Multiple fields)](#22-partial-updates-single--multiple-fields)
  - [2.3. Empty Update Payload](#23-empty-update-payload)
  - [2.4. Invalid Update Payloads](#24-invalid-update-payloads)
- [3. Delete Document Type (`DELETE /api/v1/masters/document-types/:id`)](#3-delete-document-type-delete-apiv1mastersdocument-typesid)
  - [3.1. Soft Delete (Default / No Query Params)](#31-soft-delete-default--no-query-params)
  - [3.2. Force / Permanent Delete](#32-force--permanent-delete)
  - [3.3. Invalid Delete Query Params](#33-invalid-delete-query-params)
- [4. Status Toggle Payloads (`PATCH /api/v1/masters/document-types/:id/enable|disable`)](#4-status-toggle-payloads-patch-apiv1mastersdocument-typesidenabledisable)

---

## 1. Create Document Type (`POST /api/v1/masters/document-types`)
Validated using: `documentTypesInputValidator`

### 1.1. Full Payload (All fields)
```json
{
  "title": "Tax Invoice",
  "label": "Tax Invoice",
  "color": "#1E88E5",
  "is_default": true
}
```

### 1.2. Minimum Required Payload
`is_default` is optional and defaults to `false`.
```json
{
  "title": "Identity Proof",
  "label": "ID Proof",
  "color": "#43A047"
}
```

### 1.3. Explicit `is_default: false`
```json
{
  "title": "Address Proof",
  "label": "Utility Bill / Rental Agreement",
  "color": "#FB8C00",
  "is_default": false
}
```

### 1.4. Invalid Payloads (Error Cases)

#### Missing Required Fields (`title`, `label`, or `color` missing)
```json
{
  "label": "ID Proof",
  "color": "#43A047"
}
```

#### `title` Too Short (less than 3 characters)
```json
{
  "title": "ID",
  "label": "ID Proof",
  "color": "#43A047",
  "is_default": false
}
```

#### `title` Too Long (greater than 255 characters)
```json
{
  "title": "This is an extremely long title exceeding two hundred and fifty-five characters limit test document type designed to fail Joi validation rules because the maximum length constraint is 255 characters total across the string and any longer string should be rejected.",
  "label": "Invalid Length",
  "color": "#E53935"
}
```

#### Invalid Data Types
```json
{
  "title": 12345,
  "label": true,
  "color": 999,
  "is_default": "not-a-boolean"
}
```

#### Empty String Values
```json
{
  "title": "",
  "label": "",
  "color": "",
  "is_default": false
}
```

---

## 2. Update Document Type (`PUT /api/v1/masters/document-types/:id`)
Validated using: `updateDocumentTypesInputValidator`

### 2.1. Full Update Payload
```json
{
  "title": "Updated Tax Invoice",
  "label": "Updated Invoice Label",
  "color": "#3949AB",
  "is_default": true
}
```

### 2.2. Partial Updates (Single / Multiple fields)

#### Update Only `title`
```json
{
  "title": "Passport & Visa"
}
```

#### Update Only `label`
```json
{
  "label": "Travel ID"
}
```

#### Update Only `color`
```json
{
  "color": "#8E24AA"
}
```

#### Update Only `is_default`
```json
{
  "is_default": false
}
```

#### Update `title` and `color`
```json
{
  "title": "Salary Slip",
  "color": "#00ACC1"
}
```

### 2.3. Empty Update Payload
*(Valid according to Joi schema since all fields are optional)*
```json
{}
```

### 2.4. Invalid Update Payloads

#### `title` Too Short (less than 3 characters)
```json
{
  "title": "AB"
}
```

#### Empty String Field
```json
{
  "label": ""
}
```

#### Invalid Field Type
```json
{
  "is_default": "true"
}
```

---

## 3. Delete Document Type (`DELETE /api/v1/masters/document-types/:id`)
Validated using: `deleteDocumentTypesInputValidator` via Query Parameters (`req.query`).

### 3.1. Soft Delete (Default / No Query Params)
**Endpoint**: `DELETE /api/v1/masters/document-types/:id`
```json
{}
```

### 3.2. Force / Permanent Delete
**Endpoint**: `DELETE /api/v1/masters/document-types/:id?force_action=true`
**Parsed Query JSON**:
```json
{
  "force_action": true
}
```

### 3.3. Explicit Soft Delete via Query
**Endpoint**: `DELETE /api/v1/masters/document-types/:id?force_action=false`
**Parsed Query JSON**:
```json
{
  "force_action": false
}
```

### 3.4. Invalid Delete Query Params
**Endpoint**: `DELETE /api/v1/masters/document-types/:id?force_action=invalid_boolean`
**Parsed Query JSON**:
```json
{
  "force_action": "invalid_boolean"
}
```

---

## 4. Status Toggle Payloads (`PATCH /api/v1/masters/document-types/:id/enable|disable`)

- **Enable Endpoint**: `PATCH /api/v1/masters/document-types/:id/enable`
- **Disable Endpoint**: `PATCH /api/v1/masters/document-types/:id/disable`

These endpoints do not require a request body.

### Empty Request Body
```json
{}
```
