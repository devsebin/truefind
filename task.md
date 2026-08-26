User Services API – Additional Query Parameters
1. Objective

Extend the existing Get User Services API with additional query parameters for sorting and filtering services.

Important: The previously defined service_type filter remains part of this API and should not be reimplemented or repeated in this requirement. This document only defines the new parameters to be added alongside the existing functionality.

2. API Endpoint
Existing Endpoint
{{base_url}}/api/v1/users/{{user_id}}/services

Existing Query Parameters

The API already supports:

is_full_region
service_type


The new parameters defined in this document should work together with the existing parameters.

Example
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&order_by=ascending&name_like=cleaning

3. New Query Parameters

The following parameters should be added:

Parameter	Required	Allowed Values / Format	Description
order_by	No	ascending, descending	Controls the sorting order of services by service name
name_like	No	String	Filters services based on their name
4. order_by
Purpose

order_by controls the alphabetical sorting of the returned services based on the service name.

Allowed Values

Only the following values should be accepted:

ascending
descending

Behavior
order_by=ascending

Return services in alphabetical order from A → Z.

Example:

?order_by=ascending


Result:

AC Repair
Cleaning
Gardening
Painting
Plumbing

order_by=descending

Return services in reverse alphabetical order from Z → A.

Example:

?order_by=descending


Result:

Plumbing
Painting
Gardening
Cleaning
AC Repair

Default Behavior

order_by is optional.

If order_by is not provided, the API should preserve the existing/default ordering behavior.

Do not automatically apply ascending or descending ordering unless explicitly requested.

Invalid Value

If an unsupported value is provided:

?order_by=random


the API should return a 4xx validation error.

5. name_like
Purpose

name_like filters the services based on their service name.

The filter should perform a partial/case-insensitive match.

Example

Request:

?name_like=clean


Should return services such as:

Cleaning
Deep Cleaning
Home Cleaning
Office Cleaning


It should not return unrelated services such as:

Plumbing
Painting
Gardening

Case Sensitivity

The search should be case-insensitive.

For example:

?name_like=clean


and

?name_like=CLEAN


should produce the same results.

Partial Matching

The value should match any part of the service name.

For example:

?name_like=paint


can match:

Painting
House Painting
Interior Painting

Empty Value

If name_like is provided as an empty value:

?name_like=


the API should treat it as no name filter, or reject it through validation according to the project's existing query-parameter conventions. The behavior should be consistent with other optional string filters in the API.

6. Combining Parameters

The new parameters must work together with each other and with the existing query parameters.

Example 1 – Name Filter + Ascending Order
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&name_like=clean&order_by=ascending


Expected behavior:

Apply the existing service retrieval logic.
Apply the name_like=clean filter.
Sort the resulting services by name in ascending order.
Example 2 – Name Filter + Descending Order
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&name_like=clean&order_by=descending


Expected behavior:

Apply the existing service retrieval logic.
Apply the name_like=clean filter.
Sort the resulting services by name in descending order.
Example 3 – All New Parameters
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=quick_jobs&name_like=clean&order_by=ascending


The API should apply all applicable filters and sorting rules together.

The expected processing flow is:

Existing service query
        ↓
Existing service_type filtering
        ↓
name_like filtering
        ↓
order_by sorting
        ↓
Return response

7. Query Parameter Validation
order_by

Valid:

ascending
descending


Invalid:

asc
desc
random
123


Invalid values should result in a 4xx validation error.

name_like

name_like should accept a string value.

Examples:

name_like=clean
name_like=plumb
name_like=home

8. API Examples
Without New Parameters
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all


Existing behavior should remain unchanged.

With Ascending Sort
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&order_by=ascending

With Descending Sort
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&order_by=descending

With Name Filter
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&name_like=clean

With Name Filter and Sorting
{{base_url}}/api/v1/users/{{user_id}}/services?is_full_region=true&service_type=all&name_like=clean&order_by=ascending

9. Implementation Requirements
Add order_by as an optional query parameter.
Add name_like as an optional query parameter.
order_by must accept only ascending or descending.
order_by should sort by the service's name.
name_like should perform a case-insensitive partial match against the service name.
Both parameters should be independently optional.
Both parameters must be composable with the existing query parameters.
Existing service retrieval behavior must not be changed when these parameters are omitted.
Do not duplicate or alter the previously implemented service_type filtering logic.
Apply filtering before sorting.
Ensure the implementation does not introduce unnecessary in-memory filtering/sorting if the underlying database/query layer can perform these operations efficiently.
10. Acceptance Criteria
 order_by=ascending sorts services by name A → Z.
 order_by=descending sorts services by name Z → A.
 Missing order_by preserves the existing/default ordering.
 Invalid order_by values return a 4xx validation error.
 name_like performs a partial match against the service name.
 name_like matching is case-insensitive.
 Missing name_like does not filter services.
 order_by and name_like can be used together.
 New parameters work with the existing service_type parameter.
 New parameters work with is_full_region.
 Existing API behavior is unchanged when the new parameters are not supplied.
 Unit/integration tests cover the new filtering and sorting behavior.
 Tests cover valid and invalid order_by values.
 Tests cover case-insensitive and partial name_like matching.
 Tests cover combinations of name_like and order_by.
11. Summary

The User Services API should support the following query parameters:

is_full_region
service_type
order_by
name_like


The newly introduced parameters are:

order_by
name_like


order_by controls alphabetical sorting, while name_like provides case-insensitive partial filtering by service name. Both are optional and must work seamlessly with the existing API filters.