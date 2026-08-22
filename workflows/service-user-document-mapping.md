Implementation Requirements: Service User Document Configuration Module
1. Objective

Implement a new module named service-user-document-configuration under:

D:\WorkSpace\trufindo\new\src\resources\v1


The purpose of this module is to track the documents that a user must upload to become eligible for a selected service.

A new model named serviceUserDocumentConfigurationsModel has already been created for this functionality.

The implementation must strictly follow the existing project structure, architecture, naming conventions, coding patterns, validation patterns, controller/service/repository patterns, routing conventions, and error-handling conventions used by the other modules under src/resources/v1.

Do not introduce a new architectural pattern if an equivalent pattern already exists in the project.

2. Existing Collections / Models
Service User Configuration

Existing module/model responsible for storing the user's selected service configuration.

Collection:

service-user-configuration


This configuration must have a service status that indicates whether the user can proceed based on document requirements.

Required statuses for this functionality:

pending
success

Service Document Configuration

Existing collection:

service_document_configurations


This collection is the source of truth for determining whether a service requires documents for eligibility.

A service can have:

No document configuration records.
One document configuration record.
Multiple document configuration records.
Service User Document Configuration

New model:

serviceUserDocumentConfigurationsModel


Collection:

service_user_document_configurations


This collection tracks each document that a specific user needs to upload for a specific service.

3. New Module

Create the following module:

D:\WorkSpace\trufindo\new\src\resources\v1\service-user-document-configuration


Before implementing anything, inspect the existing modules under:

D:\WorkSpace\trufindo\new\src\resources\v1


Identify the module that most closely matches this functionality and use it as the structural/template reference.

The new module must follow the same directory structure and file organization as the existing modules.

Do not arbitrarily create files such as controllers, services, repositories, validators, routes, etc. unless those files exist as part of the established project/module pattern.

4. Existing APIs That Must Be Updated

There are two existing APIs involved in creating service-user configurations.

Bulk Service Configuration API
{{url}}/api/v1/service-user-configurations


The payload contains an array of service_ids.

Conceptually:

{
  "service_ids": [
    "service-id-1",
    "service-id-2",
    "service-id-3"
  ]
}


For every service ID in this array, document eligibility must be checked independently.

Single Service Configuration API
{{url}}/api/v1/service-user-configurations/single


This API creates a service-user configuration for a single service.

The exact same document eligibility logic must be applied here.

5. Core Business Requirement

Whenever a service-user configuration is created through either API:

Identify the selected service.
Query service_document_configurations using the relevant service_id.
Determine whether the service requires any documents.
If documents are required:
Create a separate service_user_document_configurations record for each required document.
Set the service-user configuration status to pending.
If no documents are required:
Do not create any service_user_document_configurations records.
Set the service-user configuration status to success.
6. Document Requirement Logic

service_document_configurations must be treated as the source of truth.

For a selected service:

service_id
    ↓
service_document_configurations
    ↓
Check matching records

Case A — Documents Required

If matching records are found:

service_document_configurations
    ↓
One or more required documents


Then:

service-user-configuration.status = pending


And create one record in:

service_user_document_configurations


for each required document.

For example, if a service requires:

Aadhaar
PAN
Address Proof


then create:

service_user_document_configurations
    ├── Aadhaar
    ├── PAN
    └── Address Proof


Do not store all required documents in a single user-document configuration record unless that is explicitly how the existing model is designed.

Case B — No Documents Required

If no matching records exist in:

service_document_configurations


then:

service-user-configuration.status = success


and:

service_user_document_configurations


must not receive any records for that service.

7. Bulk API Requirements

For:

{{url}}/api/v1/service-user-configurations


the logic must execute independently for every service ID in service_ids.

Example:

Input:

service_ids:
    Service A
    Service B
    Service C


Assume:

Service A → requires 2 documents
Service B → requires 0 documents
Service C → requires 3 documents


Expected result:

Service A
    service-user-configuration.status = pending
    service_user_document_configurations = 2 records

Service B
    service-user-configuration.status = success
    service_user_document_configurations = 0 records

Service C
    service-user-configuration.status = pending
    service_user_document_configurations = 3 records


One service's document requirement must not affect another service.

8. Single API Requirements

For:

{{url}}/api/v1/service-user-configurations/single


apply exactly the same rules.

If documents are required
service-user-configuration.status = pending


and create one service_user_document_configurations record per required document.

If documents are not required
service-user-configuration.status = success


and create no user-document configuration records.

9. Reusable Business Logic

Do not duplicate the document eligibility logic between the bulk and single APIs.

The project should have a reusable service/helper/use-case/business-logic implementation, following whatever pattern is already established in the existing codebase.

Conceptually:

Bulk API
   ↓
Create service-user configuration
   ↓
Reusable document eligibility logic
   ↓
Determine required documents
   ↓
Update status
   ↓
Create user-document configuration records


Single API
   ↓
Create service-user configuration
   ↓
Reusable document eligibility logic
   ↓
Determine required documents
   ↓
Update status
   ↓
Create user-document configuration records


The actual implementation structure must be based on the existing project conventions rather than the conceptual diagram above.

10. New Module Responsibilities

The new service-user-document-configuration module should be responsible for the functionality appropriate to service_user_document_configurations.

Inspect existing modules first and determine how similar modules expose:

Models.
Controllers.
Services.
Repositories.
Routes.
Validators.
DTOs.
Types/interfaces.
Constants.
Response handling.
Error handling.

Replicate those conventions exactly.

Do not introduce unnecessary CRUD endpoints if the project does not require them for this module.

Only implement functionality that is required by the existing application flow and the established project architecture.

11. Model Integration

Use the existing:

serviceUserDocumentConfigurationsModel


rather than creating a duplicate model.

The new module must correctly integrate this model with:

service_document_configurations


and the existing service-user configuration model.

Each generated user-document configuration should contain the appropriate references required by the existing schema/model, such as:

User reference.
Service reference.
Service-user configuration reference.
Service document configuration reference.
Required document reference.
Any other mandatory fields already defined by serviceUserDocumentConfigurationsModel.

Do not invent field names if the model/schema already defines them. Inspect the existing model and follow its schema exactly.

12. Existing Project Structure Is Authoritative

Before making changes:

Inspect D:\WorkSpace\trufindo\new\src\resources\v1.
Inspect several existing modules.
Identify the closest equivalent module.
Inspect its:
Directory structure.
Controller implementation.
Service/business logic.
Repository/data access.
Model usage.
Validation.
Routes.
Dependency injection.
Response format.
Error handling.
Tests, if present.
Replicate the established conventions for the new module.

The existing project structure is authoritative.

Do not restructure existing modules.

Do not refactor unrelated code.

Do not introduce a different naming convention.

Do not introduce a new dependency unless absolutely necessary and consistent with the project.

13. Status Rules

The final status logic must be exactly:

Condition	Service User Configuration Status	User Document Records
Service has one or more required documents	pending	One record per required document
Service has no required documents	success	No records

The status must reflect the document requirement immediately after service-user configuration creation.

14. Duplicate Handling

Inspect the existing application behaviour and database constraints before implementing duplicate handling.

The implementation must not unintentionally create duplicate service_user_document_configurations records for the same service-user configuration and required document.

If the existing project already has a standard mechanism for preventing duplicates, use that mechanism.

Do not add a new duplicate-handling strategy without first checking the existing conventions.

15. Error Handling

Follow the project's existing error-handling pattern.

If retrieving service_document_configurations fails, the operation should not silently mark the service as success.

If creation of a required service_user_document_configurations record fails, the system must not leave the service-user configuration in an incorrect state.

Use the project's existing transaction mechanism if transactions are already used for similar operations.

Do not introduce a custom error-handling architecture.

16. Backward Compatibility

The implementation must preserve all existing behaviour of:

/api/v1/service-user-configurations


and:

/api/v1/service-user-configurations/single


The only new behaviour should be the required document eligibility processing.

Do not break existing request validation, response formats, authentication, authorization, or existing service configuration logic.

17. Testing / Verification

After implementation, verify at minimum the following scenarios.

Scenario 1 — Service requires one document

Expected:

service-user-configuration.status = pending

service_user_document_configurations
    = 1 record

Scenario 2 — Service requires multiple documents

Expected:

service-user-configuration.status = pending

service_user_document_configurations
    = number of required documents

Scenario 3 — Service requires no documents

Expected:

service-user-configuration.status = success

service_user_document_configurations
    = 0 records

Scenario 4 — Bulk request with mixed services

For example:

Service A → 2 documents
Service B → no documents
Service C → 1 document


Expected:

Service A → pending → 2 document records
Service B → success → 0 document records
Service C → pending → 1 document record

Scenario 5 — Single service API

Verify that the single API produces exactly the same document/status behaviour as the bulk API.

Scenario 6 — Multiple required documents

Verify that each required document produces a separate record in:

service_user_document_configurations

18. Implementation Constraints

Strictly follow these constraints:

Use the existing project architecture.
Use the existing module structure as the template.
Create the new module under D:\WorkSpace\trufindo\new\src\resources\v1.
Use the existing serviceUserDocumentConfigurationsModel.
Use service_document_configurations as the source of truth.
Apply the logic to both service-user configuration APIs.
Reuse the same business logic for bulk and single service creation.
Create one user-document configuration record per required document.
Set status to pending when documents are required.
Set status to success when no documents are required.
Do not create user-document records when no documents are required.
Preserve existing API behaviour and response contracts.
Follow existing validation, error handling, database access, dependency injection, and routing conventions.
Do not modify unrelated modules.
Do not refactor unrelated code.
Do not invent schema fields when corresponding fields already exist.
Inspect the codebase before deciding where each piece of logic belongs.
19. Definition of Done

The task is complete when:

 service-user-document-configuration exists under src/resources/v1.
 Its structure matches the established project/module structure.
 serviceUserDocumentConfigurationsModel is correctly integrated.
 service_document_configurations is queried for every selected service.
 The bulk service-user configuration API supports document eligibility processing.
 The single service-user configuration API supports document eligibility processing.
 Required documents create separate service_user_document_configurations records.
 Services with required documents are marked pending.
 Services without required documents are marked success.
 Bulk requests correctly process each service independently.
 Single and bulk APIs share the same business logic.
 Existing project conventions are strictly followed.
 Existing API behaviour is preserved.
 Duplicate records are prevented according to existing project/database conventions.
 Error handling follows existing project conventions.
 Relevant tests or equivalent verification have been completed.
 No unrelated code has been changed.