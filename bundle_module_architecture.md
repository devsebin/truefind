# Bundle Module Architecture

## Overview

The current service architecture is:

```text
Category
   │
   └── Subcategory
          │
          ├── Service A
          ├── Service B
          └── Service C
                   │
                   ├── Service Country Configuration
                   └── Service Area Configuration


Bundle
   │
   ├── Bundle Items
   │       ├── Service A
   │       ├── Service B
   │       └── Service C
   │
   ├── Bundle Country Configuration
   │
   └── Bundle Area Configuration


User
   │
   ├── User Task Mapping
   ├── User Bundle Mapping
   ├── Service Document Configurations
   └── Bundle Document Configurations
```

The recommended architecture is:

> A bundle references existing services. It does not duplicate service definitions.

---

# 1. Collections

## Required Collections

1. `bundles`
2. `bundle_service_items`
3. `bundle_country_configurations`
4. `bundle_area_configurations`
5. `user_bundle_mappings`

## Strongly Recommended

6. `bundle_document_configurations`

## Optional / Future

7. `user_bundle_document_configurations`

The existing service document workflow can initially remain separate, but a generalized user-document-requirement model can be introduced later.

---

# 2. Bundle Master Interface

```ts
export type BundleStatus =
    | "DRAFT"
    | "ACTIVE"
    | "INACTIVE"
    | "ARCHIVED";

export interface IBundleDocument
    extends CommonServiceFieldsInterface,
        Document {

    name: string;

    display_name: string;

    code: string;

    description?: string;

    icon?: Types.ObjectId;

    status: BundleStatus;

    is_active: boolean;

    is_deleted: boolean;

    sort_order?: number;

    tags?: string[];

    metadata?: Record<string, unknown>;
}
```

The `code` should be a stable business identifier, for example:

```text
HOME-MOVE
PREMIUM-CLEANING
BUSINESS-REGISTRATION
NEW-COMPANY-PACK
```

Do not use the MongoDB `_id` as the business identifier.

---

# 3. Bundle Service Items

The bundle should have a separate collection for its services rather than storing only an array of service IDs inside the bundle.

```ts
export interface IBundleServiceItem
    extends CommonServiceFieldsInterface,
        Document {

    bundle_id: Types.ObjectId;

    service_id: Types.ObjectId;

    sort_order: number;

    quantity?: number;

    is_mandatory: boolean;

    is_included: boolean;

    service_name_snapshot?: string;

    service_code_snapshot?: string;

    metadata?: Record<string, unknown>;
}
```

Example:

```text
Bundle: HOME-MOVE-PACKAGE

Bundle Items:
    1 → Packing Service
    2 → Transportation Service
    3 → Cleaning Service
```

A separate collection gives flexibility for:

- quantity
- mandatory/optional services
- service ordering
- service-specific metadata
- future service overrides
- snapshots

---

# 4. Bundle Country Configuration

The bundle country configuration should mirror the existing service country configuration.

```ts
export type BundleDiscountType =
    | "FIXED"
    | "PERCENTAGE"
    | "NONE";
```

```ts
export interface IBundleCountryConfigurationDocument
    extends CommonServiceFieldsInterface,
        Document {

    bundle_id: Types.ObjectId;

    country_id: Types.ObjectId;

    is_active: boolean;

    is_callout_bundle: boolean;

    is_fixed_price: boolean;

    currency_id: Types.ObjectId;

    price?: number;

    unit_id?: Types.ObjectId;

    minimum_price?: number;

    maximum_price?: number;

    call_out_fee?: number;

    estimated_time?: number;

    estimated_time_unit?: timeUnits;

    individual_services_total?: number;

    bundle_discount_type?: BundleDiscountType;

    bundle_discount_value?: number;

    metadata?: Record<string, unknown>;
}
```

---

# 5. Bundle Pricing

For example:

```text
Service A = $100
Service B = $150
Service C = $200

Individual total = $450

Bundle price = $399
```

Do not modify the individual service prices.

The bundle configuration can contain:

```ts
individual_services_total: 450;

bundle_discount_type: "FIXED";

bundle_discount_value: 51;

price: 399;
```

The authoritative selling price should be:

```text
price
```

The discount fields are useful for:

- UI
- reporting
- analytics
- marketing
- audit

---

# 6. Bundle Area Configuration

The area configuration should mirror the existing service-area architecture.

```ts
export interface IBundleAreaConfigurationDocument
    extends CommonServiceFieldsInterface,
        Document {

    bundle_id: Types.ObjectId;

    suburb_id: Types.ObjectId;

    country_configuration_id: Types.ObjectId;

    is_active: boolean;

    is_callout_bundle?: boolean;

    is_fixed_price?: boolean;

    currency_id?: Types.ObjectId;

    price?: number;

    unit_id?: Types.ObjectId;

    minimum_price?: number;

    maximum_price?: number;

    call_out_fee?: number;

    estimated_time?: number;

    estimated_time_unit?: timeUnits;

    individual_services_total?: number;

    bundle_discount_type?: BundleDiscountType;

    bundle_discount_value?: number;

    metadata?: Record<string, unknown>;
}
```

---

# 7. Country → Area Cloning

The recommended hierarchy is:

```text
Bundle
   │
   └── Country Configuration
             │
             ├── Area Configuration: Suburb A
             ├── Area Configuration: Suburb B
             ├── Area Configuration: Suburb C
             └── Area Configuration: Suburb D
```

When creating an area:

```text
Country Configuration
        ↓
      clone
        ↓
Area Configuration
```

The area should contain its own actual configuration values so that it can override the country defaults.

Example:

```text
Country:
price = 399

Area A:
price = 399

Area B:
price = 449
```

---

# 8. Bundle Document Configuration

A bundle contains multiple services, so the document requirements from those services must be aggregated.

For example:

```text
Bundle
 ├── Passport Application
 │      ├── Passport
 │      └── Photo
 │
 ├── Visa Application
 │      ├── Passport
 │      └── Photo
 │
 └── Travel Insurance
        └── Insurance Information
```

The final bundle requirements should be:

```text
Passport
Photo
Insurance Information
```

rather than creating duplicate Passport and Photo requirements.

---

# 9. Bundle Required Document Interface

```ts
export interface IBundleRequiredDocument {

    document_id: Types.ObjectId;

    is_mandatory: boolean;

    source_service_ids: Types.ObjectId[];

    exemption_documents?: {
        document_id: Types.ObjectId;

        condition?: "valid" | "uploaded";

    }[];

    notes?: string;
}
```

Main configuration:

```ts
export interface IBundleDocumentConfiguration
    extends CommonServiceFieldsInterface,
        Document {

    bundle_id: Types.ObjectId;

    required_documents: IBundleRequiredDocument[];

    version: number;

    is_active: boolean;

    metadata?: Record<string, unknown>;
}
```

---

# 10. Why `source_service_ids` Is Important

Suppose:

```text
Service A requires Passport

Service B requires Passport

Service C requires Driving Licence
```

The bundle should contain:

```text
Passport
Driving Licence
```

The Passport requirement can contain:

```ts
source_service_ids: [
    serviceAId,
    serviceBId
]
```

This allows the system to know why a document is required.

---

# 11. Bundle Document Generation Algorithm

When an admin publishes or updates a bundle:

```text
Bundle
   ↓
Get Bundle Service Items
   ↓
Get Service Document Configurations
   ↓
Collect all required documents
   ↓
Group by document_id
   ↓
Deduplicate
   ↓
Merge mandatory rules
   ↓
Merge exemption rules
   ↓
Save BundleDocumentConfiguration
```

Example:

```text
Service A
    Passport
    Photo

Service B
    Passport
    Bank Statement

Service C
    Passport
    Photo
```

Result:

```text
Passport
Photo
Bank Statement
```

With:

```text
Passport
    source:
        Service A
        Service B
        Service C

Photo
    source:
        Service A
        Service C

Bank Statement
    source:
        Service B
```

---

# 12. User Bundle Mapping

When a user selects a bundle, create a separate mapping.

```ts
export type UserBundleStatus =
    | "PENDING"
    | "DOCUMENTS_PENDING"
    | "DOCUMENTS_SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "CANCELLED"
    | "ON_HOLD";
```

```ts
export interface IUserBundleMapping
    extends CommonServiceFieldsInterface {

    user_id: Types.ObjectId;

    bundle_id: Types.ObjectId;

    country_id: Types.ObjectId;

    suburb_id: Types.ObjectId;

    bundle_country_configuration_id?: Types.ObjectId;

    bundle_area_configuration_id?: Types.ObjectId;

    status: UserBundleStatus;

    currency_id: Types.ObjectId;

    bundle_price_minor: number;

    individual_services_total_minor: number;

    discount_amount_minor: number;

    pricing_snapshot?: {
        bundle_price_minor: number;
        individual_services_total_minor: number;
        discount_amount_minor: number;
        discount_type?: BundleDiscountType;
        discount_value?: number;
        currency_id: Types.ObjectId;
    };

    services?: {
        service_id: Types.ObjectId;
        service_name: string;
        service_price_minor: number;
        quantity: number;
    }[];

    purchased_at?: Date;

    completed_at?: Date;

    cancelled_at?: Date;
}
```

---

# 13. Why Price Snapshots Are Required

Suppose today:

```text
Service A = $100
Service B = $200
Bundle = $250
```

The user purchases the bundle.

Tomorrow:

```text
Service A = $150
Service B = $250
Bundle = $350
```

The existing user's purchase must still be:

```text
$250
```

not:

```text
$350
```

Therefore:

```text
Configuration
    ↓
Current pricing

User Bundle Mapping
    ↓
Immutable purchase pricing snapshot
```

Historical purchases should never be recalculated from current configuration.

---

# 14. User Bundle Documents

This is the bundle equivalent of the existing user service document configuration.

```ts
export interface IServiceBundleUserDocumentUpload {

    document_id: Types.ObjectId;

    uploaded_at?: Date;

    verified_by?: Types.ObjectId;

    verified_at?: Date;

    status: ServiceUserDocumentConfigurationStatus;

    validation_notes?: string;
}
```

```ts
export interface IUserBundleDocumentConfiguration
    extends CommonServiceFieldsInterface {

    _id?: Types.ObjectId;

    user_id: Types.ObjectId;

    user_bundle_id: Types.ObjectId;

    bundle_id: Types.ObjectId;

    document_requirement_id: Types.ObjectId;

    is_mandatory: boolean;

    source_service_ids: Types.ObjectId[];

    uploads: IServiceBundleUserDocumentUpload[];

    current_status?: ServiceUserDocumentConfigurationStatus;

    verified_by?: Types.ObjectId;

    verified_at?: Date;

    created_at?: Date;

    updated_at?: Date;
}
```

---

# 15. Future Improvement: Generalized User Document Requirement

The current architecture has a service-specific user document configuration.

Eventually, both service and bundle requirements could be represented using a generalized model:

```ts
export type UserRequirementSourceType =
    | "SERVICE"
    | "BUNDLE";
```

```ts
export interface IUserDocumentRequirement
    extends CommonServiceFieldsInterface {

    user_id: Types.ObjectId;

    source_type: UserRequirementSourceType;

    service_id?: Types.ObjectId;

    bundle_id?: Types.ObjectId;

    task_id?: Types.ObjectId;

    document_requirement_id: Types.ObjectId;

    is_mandatory: boolean;

    source_service_ids?: Types.ObjectId[];

    uploads: IServiceUserDocumentUploads[];

    current_status?: ServiceUserDocumentConfigurationStatus;

    verified_by?: Types.ObjectId;

    verified_at?: Date;
}
```

This refactor does not need to happen immediately. Separate bundle collections can be implemented first.

---

# 16. Complete Bundle Collections

```text
bundles
│
├── bundle_service_items
│
├── bundle_country_configurations
│
├── bundle_area_configurations
│
└── bundle_document_configurations


users
│
├── user_bundle_mappings
│
└── user_bundle_document_configurations
```

Existing service collections remain:

```text
services
service_country_configurations
service_area_configurations
service_document_configurations

user_task_mappings
service_user_document_configurations
```

---

# 17. Admin Workflow

## Step 1 — Create Services

The existing workflow remains:

```text
Category
   ↓
Subcategory
   ↓
Service
```

---

## Step 2 — Configure Services by Country

```text
Service
   ↓
ServiceCountryConfiguration
```

Example:

```text
Cleaning Service
Australia
$100 AUD
```

---

## Step 3 — Configure Services by Area

```text
ServiceCountryConfiguration
             ↓
ServiceAreaConfiguration
```

Example:

```text
Auckland
Papatoetoe
$120
```

---

# 18. Bundle Creation

Admin creates:

```text
Bundle
```

Example:

```text
Name:
Home Move Premium

Code:
HOME-MOVE-PREMIUM
```

Initial status:

```text
DRAFT
```

---

# 19. Add Services to Bundle

Admin selects:

```text
Packing
Transportation
Cleaning
```

Create:

```text
BundleServiceItem
```

records.

Result:

```text
Bundle
  │
  ├── Packing
  ├── Transportation
  └── Cleaning
```

---

# 20. Configure Bundle Documents

Backend loads the document requirements for every service in the bundle.

Example:

```text
Packing:
    ID
    Address Proof

Transportation:
    ID
    Vehicle Document

Cleaning:
    ID
```

The bundle requirements become:

```text
ID
Address Proof
Vehicle Document
```

The `ID` requirement records all services that caused it to be required.

---

# 21. Configure Bundle Country

Admin selects a country and configures:

```text
Individual services total:
$450

Bundle price:
$399

Discount:
$51
```

Create:

```text
BundleCountryConfiguration
```

---

# 22. Configure Bundle Areas

Admin selects an area.

Backend clones:

```text
BundleCountryConfiguration
```

into:

```text
BundleAreaConfiguration
```

Admin can override:

```text
Price
Callout fee
Estimated time
Availability
etc.
```

---

# 23. Publish Bundle

Before changing:

```text
DRAFT → ACTIVE
```

validate:

```text
✓ Bundle exists
✓ Bundle has at least one service
✓ All services are ACTIVE
✓ Country configuration exists
✓ Area configuration exists where required
✓ Currency exists
✓ Price exists
✓ Document configuration generated
✓ No duplicate services
✓ No deleted services
✓ No deleted documents
```

Only then publish:

```text
ACTIVE
```

---

# 24. User Selects Bundle

When the user selects a bundle, resolve:

```text
User
 ↓
Bundle
 ↓
Country
 ↓
Area
 ↓
Bundle Area Configuration
```

Then create:

```text
UserBundleMapping
```

---

# 25. Generate User Documents

Retrieve:

```text
BundleDocumentConfiguration
```

and create:

```text
UserBundleDocumentConfiguration
```

Example:

```text
User Bundle
     │
     ├── ID
     ├── Address Proof
     └── Vehicle Document
```

Each requirement starts as:

```text
PENDING
```

---

# 26. Avoid Duplicate User Documents

If the user already has a verified document, such as:

```text
Passport.pdf
```

and the bundle requires Passport, the system should eventually allow that existing verified document to satisfy the new requirement.

The conceptual architecture should separate:

```text
User's actual uploaded document
```

from:

```text
Requirement for that document
```

Example:

```text
UserDocument
      │
      ├── Passport.pdf
      │
      ├── used by Service A requirement
      │
      └── used by Bundle B requirement
```

This will make document reuse and verification considerably easier.

---

# 27. Bundle Purchase Transaction

The selection/purchase operation should use a MongoDB transaction.

```text
START TRANSACTION

1. Validate user

2. Validate bundle

3. Validate bundle status

4. Validate country

5. Validate area

6. Get BundleAreaConfiguration

7. Get BundleDocumentConfiguration

8. Calculate/validate price

9. Create UserBundleMapping

10. Create UserBundleDocumentConfiguration records

11. Create corresponding service/task mappings if the
    downstream workflow requires individual service execution

12. Commit

END TRANSACTION
```

If any operation fails:

```text
ROLLBACK
```

---

# 28. Should a Bundle Create User Tasks?

This depends on how your application executes services.

The existing architecture has:

```ts
IUserTaskMapping {
    user_id;
    task_id;
    eligibility_status;
}
```

If each service inside a bundle is independently processed, the recommended model is:

```text
User selects Bundle
       │
       ├── UserBundleMapping
       │
       ├── Service Task A
       ├── Service Task B
       └── Service Task C
```

The bundle is therefore the:

> Commercial/package layer

while individual services remain the:

> Execution layer

This separation is important because it allows bundle-level pricing without changing how individual services are executed.

---

# 29. Recommended Relationship

```text
                  BUNDLE
                    │
                    │ contains
                    ▼
             BUNDLE SERVICE ITEMS
                    │
                    │ references
                    ▼
                 SERVICE
                    │
                    ├───────────────┐
                    ▼               ▼
             COUNTRY CONFIG    DOCUMENT CONFIG
                    │
                    ▼
               AREA CONFIG
```

User side:

```text
USER
 │
 └── USER BUNDLE MAPPING
          │
          ├── Bundle
          │
          ├── Price Snapshot
          │
          ├── Service Snapshots
          │
          └── Bundle Documents
```

---

# 30. Indexes

## `bundles`

```text
{ code: 1 } UNIQUE
{ status: 1, is_active: 1 }
{ name: 1 }
```

## `bundle_service_items`

```text
{ bundle_id: 1, service_id: 1 } UNIQUE
{ bundle_id: 1, sort_order: 1 }
{ service_id: 1 }
```

## `bundle_country_configurations`

```text
{ bundle_id: 1, country_id: 1 } UNIQUE
{ country_id: 1, is_active: 1 }
```

## `bundle_area_configurations`

```text
{ bundle_id: 1, suburb_id: 1 } UNIQUE
{ suburb_id: 1, is_active: 1 }
```

## `bundle_document_configurations`

```text
{ bundle_id: 1, is_active: 1 }
```

## `user_bundle_mappings`

```text
{ user_id: 1, created_at: -1 }

{ bundle_id: 1, status: 1 }

{ user_id: 1, bundle_id: 1, status: 1 }
```

## `user_bundle_document_configurations`

```text
{ user_bundle_id: 1 }

{ user_id: 1, current_status: 1 }

{
    user_bundle_id: 1,
    document_requirement_id: 1
} UNIQUE
```

---

# 31. Bundle Versioning

Versioning will become important when bundle composition or pricing changes.

Example:

```text
Bundle v1
    Service A
    Service B
    Price $399
```

Later:

```text
Bundle v2
    Service A
    Service B
    Service C
    Price $449
```

Existing customers should continue using the version they purchased.

A version can initially be represented within the bundle/configuration documents:

```ts
export interface IBundleVersion {
    version: number;

    published_at?: Date;

    effective_from?: Date;

    effective_until?: Date;

    is_current: boolean;
}
```

For a mature system, a separate:

```text
bundle_versions
```

collection can be introduced.

---

# 32. Final Recommended Architecture

Implement these seven collections:

```text
┌──────────────────────────────────────┐
│              BUNDLES                 │
│                                      │
│ id                                   │
│ name                                 │
│ code                                 │
│ description                          │
│ status                               │
│ icon                                 │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│       BUNDLE_SERVICE_ITEMS            │
│                                      │
│ bundle_id                            │
│ service_id                           │
│ sort_order                           │
│ quantity                             │
│ is_mandatory                         │
└──────────────────────────────────────┘

                   │
                   ▼
┌──────────────────────────────────────┐
│     BUNDLE_DOCUMENT_CONFIGURATION    │
│                                      │
│ bundle_id                            │
│ required_documents[]                 │
│ source_service_ids[]                 │
│ version                              │
└──────────────────────────────────────┘


BUNDLE
   │
   ├───────────────┐
   ▼               ▼
COUNTRY CONFIG   AREA CONFIG
                    │
                    ▼
             SUBURB / AREA


USER
 │
 ▼
USER_BUNDLE_MAPPING
 │
 ├── price snapshot
 ├── service snapshots
 ├── country
 ├── area
 └── status
       │
       ▼
USER_BUNDLE_DOCUMENT_CONFIGURATION
 │
 ├── document requirement
 ├── uploads
 ├── verification
 └── status
```

---

# 33. Final Design Principles

### 1. Bundle references services

Do not duplicate service definitions inside bundles.

### 2. Bundle pricing is independent

The bundle price can be different from the sum of individual service prices.

### 3. Country is the default configuration

Create the country-level configuration first, then clone it into area-level configurations.

### 4. Areas can override country defaults

Area configurations should have their own stored values.

### 5. Bundle documents are aggregated

Collect the document requirements of all services and deduplicate them.

### 6. Preserve document source information

Use `source_service_ids` so the system knows which services require each document.

### 7. Snapshot prices at purchase time

Never recalculate historical bundle purchases using current configuration.

### 8. Keep commercial and execution layers separate

The bundle represents the commercial package, while the individual services remain the execution units.

### 9. Use MongoDB transactions

Bundle selection, user mapping, and document requirement creation should be atomic.

### 10. Plan for versioning

Bundle composition and pricing can change over time, so historical purchases should remain tied to the version/configuration that existed at purchase time.

---

# Final Collection List

| Collection | Purpose |
|---|---|
| `bundles` | Bundle master |
| `bundle_service_items` | Services included in bundle |
| `bundle_country_configurations` | Country defaults and pricing |
| `bundle_area_configurations` | Area-specific overrides |
| `bundle_document_configurations` | Aggregated/deduplicated bundle document requirements |
| `user_bundle_mappings` | User's selected/purchased bundle |
| `user_bundle_document_configurations` | User-specific bundle document workflow |

The key architectural decision is:

> **Keep the bundle as a commercial/package entity while continuing to treat the individual services as the actual executable services. Reference services from bundles, maintain separate bundle pricing/configuration, aggregate document requirements, and create immutable snapshots when the user selects or purchases the bundle.**
