Service User Document Configuration – Upload, Approve and Reject Requirements
1. Objective
Extend the existing service-user-document-configuration module with three additional operations:

Upload — available only to users with the employee role.
Approve — validates the configured document's data_requirements before approval.
Reject — allows an employee to reject a submitted document with a mandatory rejection reason.
The implementation must strictly follow the existing project architecture and conventions under:

D:\WorkSpace\trufindo\new\src\resources\v1


Before implementing these functions, inspect the existing modules to determine the established patterns for:

Routes.
Controllers.
Services/use-cases.
Repositories.
Authentication and role authorization.
Validation.
Request/response structures.
Error handling.
Database updates.
Status handling.
Do not introduce a different architectural pattern.

2. Existing Model
The functionality operates on:

serviceUserDocumentConfigurationsModel


Collection:

service_user_document_configurations


This collection represents an individual document requirement for a user and service.

Each document requirement may contain an uploads field.

The new functionality must extend the existing uploads field rather than creating an unrelated structure.

3. Upload Function
3.1 Access Control
The upload operation must be available only to users with the employee role.

The implementation must use the project's existing authentication and authorization mechanism.

Do not implement a separate/custom role-checking mechanism if the project already provides middleware, guards, policies, or authorization utilities.

If a non-employee attempts to use the upload operation, the request must be rejected using the project's standard authorization error response.

4. Upload Data
When an employee uploads a document for a service_user_document_configuration, update the uploads field with the following information:

document_id
uploaded_at
status


The exact type/structure must follow the existing uploads schema if one already exists.

Conceptually, the uploaded information should contain:

{
  "document_id": "<uploaded-document-id>",
  "uploaded_at": "<timestamp>",
  "status": "<upload-status>"
}


Do not overwrite unrelated information already stored in uploads.

If uploads is an array/history structure in the existing model, append the new upload information according to the existing schema.

If uploads is an object, update the corresponding fields while preserving existing information.

Inspect the existing model/schema before implementing this behaviour.

5. Upload Status
The upload operation must set the appropriate upload status according to the project's existing status conventions.

If no existing upload-status convention exists, use the status convention already established by the service-user-document-configuration module.

Do not introduce multiple competing status formats.

The upload operation itself should indicate that the required document has been submitted and is ready for review.

6. Approve Function
Add an approve operation to the module.

Approval must not happen automatically just because a document was uploaded.

Before approval, the system must validate all data_requirements associated with the document.

The relevant document configuration is available through the service/document configuration relationship.

The implementation must retrieve the corresponding service_documents configuration and inspect its data_requirements.

7. Data Requirements
The service_documents configuration contains:

data_requirements


Each requirement evaluates to either:

true


or:

false


Approval is allowed only when every data requirement evaluates to true.

Conceptually:

data_requirements:
    requirement_1 = true
    requirement_2 = true
    requirement_3 = true

→ APPROVE


But:

data_requirements:
    requirement_1 = true
    requirement_2 = false
    requirement_3 = true

→ DO NOT APPROVE


8. Approval Validation Rule
The core approval condition is:

ALL data_requirements must be true


Equivalent logical behaviour:

canApprove = every(data_requirements) === true


If any requirement is false, approval must fail.

If all requirements are true, approval can proceed.

Do not use an any()/partial-match condition.

For example:

true + true + false


must not be approved.

Only:

true + true + true


can be approved.

9. Approval Failure
If one or more data_requirements are false, do not update the document configuration to approved.

Return an appropriate error using the project's existing error/validation response convention.

The error should clearly indicate that the document cannot be approved because all required data requirements have not been satisfied.

Where the existing response pattern allows it, include the unsatisfied requirements so that the caller can identify what is missing.

Conceptually:

Document cannot be approved.
All data requirements must be satisfied.


If the project has a standard validation-error format, use that format instead of introducing a new response structure.

10. Successful Approval
If every data_requirements value is true:

Allow the approval.
Update the relevant upload information in uploads.
Store the approval status.
Store the appropriate approval timestamp if the existing schema supports it.
Preserve the existing upload information such as document_id and uploaded_at.
Conceptually:

{
  "document_id": "<document-id>",
  "uploaded_at": "<upload-timestamp>",
  "status": "approved"
}


The exact field structure must follow the existing model/schema.

Do not invent additional fields if the model already defines an established structure.

11. Approval and Service Eligibility
The approval operation is responsible for validating and approving the individual required document.

Do not assume that approving one document automatically makes the entire service eligible.

If the existing application has a service-level eligibility/status mechanism, inspect it and determine whether the service-user configuration should be updated only after all required user documents have been approved.

The existing requirement is:

Service has required documents
    ↓
service-user-configuration.status = pending


Therefore, document approval should be compatible with this workflow.

If all required documents for the service are eventually approved, the service-level status may be updated according to the existing project's business rules.

Do not invent a new service-level transition without checking the existing implementation and schema first.

12. Reject Function
Add a reject operation to the module.

An employee must be able to reject a submitted document.

Rejection requires a mandatory:

reason


The rejection reason must be stored inside the uploads field along with the existing upload information.

13. Rejection Request
The rejection request must contain a reason.

Conceptually:

{
  "reason": "The uploaded document is unclear and cannot be verified."
}


The exact request DTO/body structure must follow the project's existing conventions.

The reason must not be optional.

If the reason is missing or empty, return the project's standard validation error.

14. Rejection Data
When a document is rejected, update the relevant uploads information with the rejection reason while preserving the existing upload information.

Conceptually:

{
  "document_id": "<document-id>",
  "uploaded_at": "<upload-timestamp>",
  "status": "rejected",
  "reason": "The uploaded document is unclear and cannot be verified."
}


If the existing uploads structure supports multiple upload/review events, follow that structure and preserve the history.

Do not discard the original document_id or uploaded_at.

15. Upload → Review Workflow
The expected document lifecycle is:

Document requirement created
        ↓
User needs to provide document
        ↓
Employee uploads document
        ↓
uploads updated
        ↓
status = uploaded/submitted
        ↓
Employee reviews document
        ↓
       ┌───────────────┐
       │               │
    Approve          Reject
       │               │
       ↓               ↓
Validate all       Require reason
data_requirements      │
       │               ↓
       │           status = rejected
       ↓               │
All true               │
       │               │
       ↓               │
status = approved ←───┘


The exact status names should follow the existing project's conventions.

16. Approval Workflow in Detail
When an employee calls the approve operation:

1. Authenticate employee
        ↓
2. Load service_user_document_configuration
        ↓
3. Identify associated service document
        ↓
4. Load service_documents configuration
        ↓
5. Read data_requirements
        ↓
6. Evaluate every requirement
        ↓
7. Are all requirements true?
        │
       ┌┴─────────────┐
      YES             NO
       │               │
       ↓               ↓
Update uploads     Return error
status=approved    Do not approve


17. Rejection Workflow in Detail
When an employee calls the reject operation:

1. Authenticate employee
        ↓
2. Validate rejection reason
        ↓
3. Load service_user_document_configuration
        ↓
4. Load existing uploads information
        ↓
5. Preserve existing upload information
        ↓
6. Add rejection reason
        ↓
7. Set upload status = rejected
        ↓
8. Save changes


18. Role Authorization
The following operations must respect employee authorization:

Upload
employee only


Approve
Use the existing project's authorization convention. If these document-review operations are employee operations, enforce the same employee authorization mechanism.

Reject
Use the same authorization mechanism as approve.

Do not rely solely on the frontend to restrict these operations.

Authorization must be enforced server-side.

19. Data Preservation
When modifying uploads, do not unintentionally remove existing information.

For example, if the existing upload contains:

{
  "document_id": "DOC123",
  "uploaded_at": "2026-08-22T10:00:00Z",
  "status": "uploaded"
}


after rejection it should conceptually become:

{
  "document_id": "DOC123",
  "uploaded_at": "2026-08-22T10:00:00Z",
  "status": "rejected",
  "reason": "Document is not readable."
}


The existing upload information must remain available.

If the model defines uploads as an array, preserve the existing array/history semantics rather than converting it to an object.

20. Existing Schema Is Authoritative
Before implementing the new functionality, inspect:

serviceUserDocumentConfigurationsModel.
service_document_configurations.
service_documents.
Existing service-user configuration model.
Existing upload-related models.
Existing status constants.
Existing authentication/authorization middleware.
Existing request validation.
Existing controllers/services/repositories.
Pay particular attention to the actual structure of:

uploads


and:

data_requirements


Do not make assumptions about their MongoDB/ORM representation.

21. API Design
Create routes for the new operations according to the project's existing REST/API conventions.

Conceptually, the module will expose:

upload
approve
reject


The exact HTTP methods and URL patterns must be determined by inspecting existing modules in:

D:\WorkSpace\trufindo\new\src\resources\v1


Do not arbitrarily choose route naming or HTTP methods if the project already has an established convention.

22. Suggested Conceptual API Behaviour
The exact route structure must follow the project conventions, but the operations should support the following behaviour.

Upload
Input should identify the relevant service_user_document_configuration and the uploaded document.

The operation should:

- Verify employee authorization.
- Validate the uploaded document.
- Store document_id.
- Store uploaded_at.
- Set upload status.
- Preserve existing uploads information.


Approve
Input should identify the relevant service_user_document_configuration.

The operation should:

- Verify authorization.
- Retrieve associated service document.
- Retrieve data_requirements.
- Verify every requirement is true.
- Reject approval if any requirement is false.
- Update uploads with approved status if all requirements are true.


Reject
Input should identify the relevant service_user_document_configuration and provide:

reason


The operation should:

- Verify authorization.
- Validate reason.
- Preserve existing upload data.
- Store rejection reason.
- Set status to rejected.


23. Validation Requirements
Upload
Validate all fields required by the existing model/schema and upload mechanism.

Approve
Validate that:

The target service-user-document configuration exists.
The associated service document exists.
data_requirements can be evaluated.
Every requirement is satisfied before approval.
Reject
Validate that:

The target service-user-document configuration exists.
A rejection reason is supplied.
The reason is not empty/whitespace.
The existing upload information can be updated.
Use existing validation utilities and conventions.

24. Error Scenarios
The implementation must handle at least these scenarios:

Unauthorized upload
Non-employee attempts upload
→ Authorization error


Document configuration not found
Requested service-user-document configuration does not exist
→ Not found error


Service document not found
Associated service document does not exist
→ Appropriate not found/business error


Approval requirements not satisfied
One or more data_requirements = false
→ Approval rejected
→ Existing status remains unchanged


Missing rejection reason
Reject request without reason
→ Validation error


Successful approval
All data_requirements = true
→ status = approved


Successful rejection
Valid reason supplied
→ status = rejected
→ reason stored in uploads


25. Bulk Service Configuration Compatibility
The previously implemented service-user configuration logic remains unchanged:

service_document_configurations
        ↓
documents required?
        ↓
YES → service-user-configuration.status = pending
       ↓
       create service_user_document_configurations
       records


The newly added upload/approve/reject functionality operates on these generated document configuration records.

Therefore, the implementation must be compatible with records created by both:

{{url}}/api/v1/service-user-configurations


and:

{{url}}/api/v1/service-user-configurations/single


26. Avoid Duplicate Business Logic
Keep document operations inside the appropriate new module/business layer.

Do not implement upload, approval, or rejection logic directly inside unrelated controllers.

Follow the existing project architecture, for example:

Route
  ↓
Controller
  ↓
Service / Use Case
  ↓
Repository / Model


Only use these layers if that is how the existing project is structured.

27. Transaction and Consistency
Follow the existing project's transaction conventions.

For approval:

Validate data_requirements
        ↓
Only after validation succeeds
        ↓
Update uploads/status


Never update the status to approved before confirming that every data_requirement is true.

For rejection:

Validate reason
        ↓
Update uploads/status atomically


Avoid leaving partially updated upload data.

28. Testing Requirements
Verify the following cases.

Upload
 Employee can upload a document.
 Non-employee cannot upload.
 document_id is stored.
 uploaded_at is stored.
 Upload status is stored.
 Existing upload information is preserved.
Approve
 Employee can attempt approval.
 Associated service_documents configuration is loaded.
 data_requirements are evaluated.
 Approval succeeds when every requirement is true.
 Approval fails when any requirement is false.
 Approval failure returns an appropriate error.
 Approval failure does not incorrectly change the status.
 Successful approval updates the upload status.
 Existing upload fields remain intact.
Reject
 Employee can reject a document.
 Rejection reason is mandatory.
 Empty rejection reason is rejected.
 Rejection reason is stored in uploads.
 Existing document_id is preserved.
 Existing uploaded_at is preserved.
 Upload status becomes rejected.
 Existing upload information is not unintentionally lost.
Integration
 Documents created by the bulk service configuration API can be uploaded/reviewed.
 Documents created by the single service configuration API can be uploaded/reviewed.
 Multiple document requirements for the same service can be independently reviewed.
 Approving one document does not incorrectly approve another required document.
29. Implementation Constraints
Strictly follow these requirements:

Use the existing serviceUserDocumentConfigurationsModel.
Implement functionality inside the service-user-document-configuration module.
Strictly follow the existing project structure.
Inspect similar modules before implementing.
Do not introduce a new architectural pattern.
Upload must be restricted to the employee role.
Store document_id, uploaded_at, and status in uploads.
Preserve existing upload information when updating uploads.
Approval must validate every data_requirements value.
Approval is allowed only when all data_requirements are true.
If any requirement is false, return an appropriate error and do not approve.
Successful approval must update the upload information accordingly.
Rejection requires a mandatory reason.
Store the rejection reason in uploads along with the existing upload information.
Use existing authentication, authorization, validation, error handling, status constants, and database conventions.
Do not invent field names that conflict with the existing schema.
Do not modify unrelated modules.
Do not change existing API contracts unless required for this functionality.
Do not duplicate business logic between controllers or APIs.
Maintain data consistency and use existing transaction conventions where applicable.
30. Definition of Done
The implementation is complete when:

 service-user-document-configuration contains the upload functionality.
 Upload is restricted to employees.
 Upload stores document_id, uploaded_at, and status in the existing uploads structure.
 Approve functionality is implemented.
 Approve loads the relevant service_documents.
 Approve evaluates every data_requirement.
 Approval succeeds only when all requirements are true.
 Approval returns an appropriate error when any requirement is false.
 Successful approval updates the upload status and preserves existing data.
 Reject functionality is implemented.
 Reject requires a reason.
 Rejection reason is stored inside uploads.
 Rejection preserves existing upload information.
 Appropriate authorization is enforced server-side.
 Validation follows project conventions.
 Error handling follows project conventions.
 Routes follow existing project conventions.
 The implementation works with document configurations generated by both bulk and single service-user configuration APIs.
 Relevant unit/integration tests or equivalent verification are completed.
 No unrelated project structure or functionality is changed.


