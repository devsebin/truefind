# Service Document Configurations JSON Payloads

Comprehensive JSON payload examples for all endpoints and validation scenarios in the **Service Document Configurations** master module.

---

## Table of Contents
- [1. Create/Upsert Configuration (`POST /api/v1/masters/service-document-configurations`)](#1-createupsert-configuration-post-apiv1mastersservice-document-configurations)
  - [1.1. Single Required Document without Exemption](#11-single-required-document-without-exemption)
  - [1.2. Multiple Required Documents with Exemptions](#12-multiple-required-documents-with-exemptions)
  - [1.3. Invalid Payloads (Error Scenarios)](#13-invalid-payloads-error-scenarios)
- [2. Update Configuration (`PUT /api/v1/masters/service-document-configurations/:id`)](#2-update-configuration-put-apiv1mastersservice-document-configurationsid)
  - [2.1. Update Document List](#21-update-document-list)
  - [2.2. Invalid Update Payloads](#22-invalid-update-payloads)
- [3. Status & Lifecycle Endpoints](#3-status--lifecycle-endpoints)
  - [3.1. Enable Configuration (`PATCH /api/v1/masters/service-document-configurations/:id/enable`)](#31-enable-configuration-patch-apiv1mastersservice-document-configurationsidenable)
  - [3.2. Disable Configuration (`PATCH /api/v1/masters/service-document-configurations/:id/disable`)](#32-disable-configuration-patch-apiv1mastersservice-document-configurationsiddisable)
  - [3.3. Delete Configuration (`DELETE /api/v1/masters/service-document-configurations/:id`)](#33-delete-configuration-delete-apiv1mastersservice-document-configurationsid)

---

## 1. Create/Upsert Configuration (`POST /api/v1/masters/service-document-configurations`)

### 1.1. Single Required Document without Exemption
```json
{
  "service_id": "64c9f1a234567890abcdef01",
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef02",
      "is_mandatory": true,
      "exemption_documents": []
    }
  ]
}
```

### 1.2. Multiple Required Documents with Exemptions
```json
{
  "service_id": "64c9f1a234567890abcdef01",
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef02",
      "is_mandatory": true,
      "exemption_documents": [
        {
          "document_id": "64c9f1a234567890abcdef03",
          "condition": "valid"
        }
      ]
    },
    {
      "document_id": "64c9f1a234567890abcdef04",
      "is_mandatory": false,
      "exemption_documents": [
        {
          "document_id": "64c9f1a234567890abcdef05",
          "condition": "uploaded"
        }
      ]
    }
  ]
}
```

### 1.3. Invalid Payloads (Error Scenarios)

#### Missing Required `service_id`
```json
{
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef02",
      "is_mandatory": true
    }
  ]
}
```

#### Empty `required_documents` Array
```json
{
  "service_id": "64c9f1a234567890abcdef01",
  "required_documents": []
}
```

#### Duplicate `document_id` in `required_documents`
```json
{
  "service_id": "64c9f1a234567890abcdef01",
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef02",
      "is_mandatory": true
    },
    {
      "document_id": "64c9f1a234567890abcdef02",
      "is_mandatory": false
    }
  ]
}
```

#### Self-Exemption (Exempting a document with itself)
```json
{
  "service_id": "64c9f1a234567890abcdef01",
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef02",
      "is_mandatory": true,
      "exemption_documents": [
        {
          "document_id": "64c9f1a234567890abcdef02",
          "condition": "valid"
        }
      ]
    }
  ]
}
```

#### Invalid Condition Type in Exemption
```json
{
  "service_id": "64c9f1a234567890abcdef01",
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef02",
      "exemption_documents": [
        {
          "document_id": "64c9f1a234567890abcdef03",
          "condition": "invalid_condition"
        }
      ]
    }
  ]
}
```

---

## 2. Update Configuration (`PUT /api/v1/masters/service-document-configurations/:id`)

### 2.1. Update Document List
```json
{
  "required_documents": [
    {
      "document_id": "64c9f1a234567890abcdef03",
      "is_mandatory": true,
      "exemption_documents": []
    }
  ]
}
```

### 2.2. Invalid Update Payloads
```json
{
  "required_documents": []
}
```

---

## 3. Status & Lifecycle Endpoints

### 3.1. Enable Configuration (`PATCH /api/v1/masters/service-document-configurations/:id/enable`)
No request body required.

### 3.2. Disable Configuration (`PATCH /api/v1/masters/service-document-configurations/:id/disable`)
No request body required.

### 3.3. Delete Configuration (`DELETE /api/v1/masters/service-document-configurations/:id`)
No request body required.
