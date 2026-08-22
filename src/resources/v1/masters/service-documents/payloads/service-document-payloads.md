# Service Document Payloads

## 1. Minimal Service Document Payload

```json
{
  "name": "passport",
  "display_name": "Passport",
  "item_code": "DOC-PASSPORT",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "max_file_size": 10,
  "accepted_mimeTypes": [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ]
}
```

## 2. Address Proof

```json
{
  "name": "address_proof",
  "display_name": "Address Proof",
  "item_code": "DOC-ADDRESS",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "description": "Documents used to verify the customer's residential address.",
  "max_file_size": 20,
  "accepted_mimeTypes": [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ],
  "samples": [
    "64b7f5a2c123456789abcde1",
    "64b7f5a2c123456789abcde2"
  ],
  "status_id": "64b7f5a2c123456789abc999"
}
```

## 3. PAN Card

```json
{
  "name": "pan_card",
  "display_name": "PAN Card",
  "item_code": "DOC-PAN",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "description": "Permanent Account Number card.",
  "max_file_size": 10,
  "accepted_mimeTypes": [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ],
  "data_requirements": [
    {
      "field_name": "pan_number",
      "display_label": "PAN Number",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
      },
      "extraction_hint": {
        "keyword_anchor": "PAN"
      },
      "ocr_mapping": {
        "model_key": "pan_number",
        "confidence_threshold": 0.85
      }
    }
  ]
}
```

## 4. Salary Slip

```json
{
  "name": "salary_slip",
  "display_name": "Salary Slip",
  "item_code": "DOC-SALARY-SLIP",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "max_file_size": 15,
  "accepted_mimeTypes": [
    "application/pdf"
  ],
  "data_requirements": [
    {
      "field_name": "employee_id",
      "display_label": "Employee ID",
      "data_type": "string",
      "validation_rules": {
        "required": true
      }
    },
    {
      "field_name": "net_salary",
      "display_label": "Net Salary",
      "data_type": "number",
      "validation_rules": {
        "required": true,
        "min_value": 1000,
        "max_value": 10000000
      },
      "extraction_hint": {
        "keyword_anchor": "Net Salary"
      },
      "ocr_mapping": {
        "model_key": "net_salary",
        "confidence_threshold": 0.9
      }
    },
    {
      "field_name": "salary_month",
      "display_label": "Salary Month",
      "data_type": "date",
      "validation_rules": {
        "required": true,
        "min_value": "2025-01-01T00:00:00.000Z",
        "max_value": "2026-12-31T23:59:59.999Z"
      }
    }
  ]
}
```

## 5. Employment Certificate

```json
{
  "name": "employment_certificate",
  "display_name": "Employment Certificate",
  "item_code": "DOC-EMP-CERT",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "max_file_size": 10,
  "accepted_mimeTypes": [
    "application/pdf"
  ],
  "data_requirements": [
    {
      "field_name": "employment_type",
      "display_label": "Employment Type",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "allowed_values": [
          "Permanent",
          "Contract",
          "Temporary",
          "Intern"
        ]
      }
    },
    {
      "field_name": "designation",
      "display_label": "Designation",
      "data_type": "string",
      "validation_rules": {
        "required": true
      }
    }
  ]
}
```

## 6. Bank Statement

```json
{
  "name": "bank_statement",
  "display_name": "Bank Statement",
  "item_code": "DOC-BANK-STMT",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "description": "Bank statement used for financial verification.",
  "max_file_size": 25,
  "accepted_mimeTypes": [
    "application/pdf"
  ],
  "data_requirements": [
    {
      "field_name": "account_holder_name",
      "display_label": "Account Holder Name",
      "data_type": "string",
      "validation_rules": {
        "required": true
      }
    },
    {
      "field_name": "customer_name",
      "display_label": "Customer Name",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "must_match_field": "account_holder_name"
      }
    },
    {
      "field_name": "account_number",
      "display_label": "Account Number",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "pattern": "^[0-9]{9,18}$"
      }
    }
  ]
}
```

## 7. Consent Form

```json
{
  "name": "consent_form",
  "display_name": "Customer Consent Form",
  "item_code": "DOC-CONSENT",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "max_file_size": 10,
  "accepted_mimeTypes": [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ],
  "data_requirements": [
    {
      "field_name": "customer_consent",
      "display_label": "Customer Consent",
      "data_type": "boolean",
      "expected_value": true,
      "validation_rules": {
        "required": true
      },
      "extraction_hint": {
        "keyword_anchor": "I agree"
      },
      "ocr_mapping": {
        "model_key": "customer_consent",
        "confidence_threshold": 0.95
      }
    }
  ]
}
```

## 8. Identity Verification

```json
{
  "name": "identity_verification",
  "display_name": "Identity Verification Document",
  "item_code": "DOC-ID-VERIFY",
  "document_type_id": "64b7f5a2c123456789abcdef",
  "description": "Identity document used for customer verification.",
  "max_file_size": 20,
  "accepted_mimeTypes": [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ],
  "samples": [
    "64b7f5a2c123456789abcde1"
  ],
  "data_requirements": [
    {
      "field_name": "full_name",
      "display_label": "Full Name",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "pattern": "^[A-Za-z ]+$"
      },
      "extraction_hint": {
        "region_hint": "top-left",
        "keyword_anchor": "Name"
      },
      "ocr_mapping": {
        "model_key": "full_name",
        "confidence_threshold": 0.9
      }
    },
    {
      "field_name": "date_of_birth",
      "display_label": "Date of Birth",
      "data_type": "date",
      "validation_rules": {
        "required": true,
        "min_value": "1900-01-01T00:00:00.000Z",
        "max_value": "2026-08-21T00:00:00.000Z"
      },
      "extraction_hint": {
        "keyword_anchor": "Date of Birth"
      },
      "ocr_mapping": {
        "model_key": "date_of_birth",
        "confidence_threshold": 0.9
      }
    },
    {
      "field_name": "gender",
      "display_label": "Gender",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "allowed_values": [
          "Male",
          "Female",
          "Other"
        ]
      }
    },
    {
      "field_name": "document_number",
      "display_label": "Document Number",
      "data_type": "string",
      "validation_rules": {
        "required": true,
        "pattern": "^[A-Z0-9]{8,20}$"
      },
      "extraction_hint": {
        "keyword_anchor": "Document No"
      },
      "ocr_mapping": {
        "model_key": "document_number",
        "confidence_threshold": 0.92
      }
    }
  ],
  "status_id": "64b7f5a2c123456789abc999"
}
```
