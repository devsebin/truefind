Bundle Approval & Notification API
1. Bundle Approval API

Create a new API to allow an Admin to approve a bundle.

Access Control
The API must be accessible only to users with the admin access role.
Configure the appropriate accessRole in apiData.
Non-admin users must not be allowed to invoke the API.
Follow the existing API authorization and validation patterns.
Bundle Approval

When the Admin approves a bundle:

Validate that the bundle exists.
Validate that the bundle is in an approvable state.
Update the bundle status to the appropriate approved status.
After the approval is successfully persisted, trigger the notification process.

The notification process should not run if bundle approval fails.

2. Identify Eligible Users

After a bundle is successfully approved:

Identify the suburb associated with the bundle.
Fetch users belonging to that suburb.
Fetch all services included in the approved bundle.
For each user, verify that every service in the bundle is enabled for that user.
Eligibility Rule

A user is eligible for the notification only if:

ALL services in the bundle are enabled for the user


If the bundle contains:

Service A
Service B
Service C


User 1:

Service A → Enabled
Service B → Enabled
Service C → Enabled


→ Eligible — send notification

User 2:

Service A → Enabled
Service B → Enabled
Service C → Disabled


→ Not eligible — do not send notification

User 3:

Service A → Enabled
Service B → Disabled
Service C → Enabled


→ Not eligible — do not send notification

A user must not receive a notification if even one service from the bundle is not enabled.

3. Message Broadcasting Service

For notification broadcasting, first check whether the existing startup/service structure can be reused:

import "./resources/v1/masters/providers/helpers/support/handler.startup";

If reusable

Reuse the existing message handling/broadcasting mechanism.

If not reusable

Create a new Message Broadcasting Service following the same structure and conventions as:

import "./resources/v1/masters/providers/helpers/support/handler.startup";


The service should support:

Message creation
Message broadcasting
Recipient handling
Error handling
Logging
Delivery status tracking
Extensibility for additional notification channels

The bundle approval API should invoke the broadcasting service only after successful bundle approval.

4. Featuristic Notification Collections

Create the following collections.

4.1 notifications

This collection stores the notification/event itself.

Purpose

Represents a notification generated from a business event, such as:

BUNDLE_APPROVED

Suggested schema
{
  _id: ObjectId,

  type: "BUNDLE_APPROVED",

  title: String,

  message: String,

  bundleId: ObjectId,

  suburbId: ObjectId,

  createdBy: ObjectId, // Admin who approved the bundle

  metadata: {
    bundleName: String,

    serviceIds: [ObjectId]
  },

  createdAt: Date,

  updatedAt: Date
}

Example
{
  _id: ObjectId("..."),

  type: "BUNDLE_APPROVED",

  title: "Bundle Approved",

  message: "The Premium Care bundle is now available for you.",

  bundleId: ObjectId("bundle-id"),

  suburbId: ObjectId("suburb-id"),

  createdBy: ObjectId("admin-id"),

  metadata: {
    bundleName: "Premium Care",
    serviceIds: [
      ObjectId("service-1"),
      ObjectId("service-2"),
      ObjectId("service-3")
    ]
  },

  createdAt: ISODate("2026-08-28T..."),
  updatedAt: ISODate("2026-08-28T...")
}

5. notificationRecipients

This collection stores the users who are eligible to receive a notification.

Purpose

Maintain recipient-level notification state independently from the notification itself.

Suggested schema
{
  _id: ObjectId,

  notificationId: ObjectId,

  userId: ObjectId,

  suburbId: ObjectId,

  status: "PENDING",

  sentAt: Date | null,

  readAt: Date | null,

  failureReason: String | null,

  createdAt: Date,

  updatedAt: Date
}

Supported statuses
PENDING
SENT
FAILED
READ


Example:

{
  _id: ObjectId("..."),

  notificationId: ObjectId("notification-id"),

  userId: ObjectId("user-id"),

  suburbId: ObjectId("suburb-id"),

  status: "SENT",

  sentAt: ISODate("2026-08-28T..."),

  readAt: null,

  failureReason: null,

  createdAt: ISODate("2026-08-28T..."),

  updatedAt: ISODate("2026-08-28T...")
}

6. notificationTemplates

Create this collection if notification content needs to be reusable/configurable.

Purpose

Store notification templates by notification type rather than hardcoding messages in the service.

Suggested schema
{
  _id: ObjectId,

  type: "BUNDLE_APPROVED",

  title: "Bundle Approved",

  message: "The {{bundleName}} bundle is now available for you.",

  channel: "IN_APP",

  isActive: true,

  createdAt: Date,

  updatedAt: Date
}

Supported channels

The initial implementation can support:

IN_APP


The design should allow future support for:

PUSH
EMAIL
SMS

7. Notification Processing Flow

The complete flow should be:

Admin
  │
  ▼
Approve Bundle API
  │
  ├── Validate accessRole = admin
  │
  ├── Validate bundle
  │
  ├── Approve bundle
  │
  ▼
Approval Successful
  │
  ▼
Identify Bundle Suburb
  │
  ▼
Get Bundle Services
  │
  ▼
Find Users in Suburb
  │
  ▼
Check User Service Eligibility
  │
  ├── All services enabled
  │        │
  │        ▼
  │   Create Notification
  │        │
  │        ▼
  │   Create Recipients
  │        │
  │        ▼
  │   Message Broadcasting Service
  │        │
  │        ▼
  │   Update Status
  │
  └── One or more services disabled
           │
           ▼
      Do NOT create recipient
      Do NOT send notification

8. Important Notification Rule

The eligibility check must happen before creating the recipient record and before broadcasting the notification.

For example, if 100 users belong to the suburb but only 65 users have all services enabled:

100 users in suburb
       │
       ▼
Service eligibility check
       │
       ├── 65 eligible
       │      │
       │      └── Notification sent
       │
       └── 35 not eligible
              │
              └── No notification


The notificationRecipients collection should contain only the 65 eligible users.

9. Recommended Indexes

Create indexes to support notification lookup and recipient processing.

notifications
type
bundleId
suburbId
createdAt


Recommended compound/index combinations:

{ bundleId: 1, type: 1 }
{ suburbId: 1, createdAt: -1 }

notificationRecipients
notificationId
userId
status
suburbId
createdAt


Recommended indexes:

{ notificationId: 1, userId: 1 }
{ userId: 1, status: 1 }
{ status: 1, createdAt: 1 }


Consider a unique index on:

{ notificationId: 1, userId: 1 }


to prevent duplicate recipients.

10. Idempotency / Duplicate Notification Handling

The bundle approval flow must prevent duplicate notifications.

If the approval event is retried or the broadcasting service is invoked more than once:

Do not create duplicate notification records for the same bundle approval event.
Do not create duplicate notificationRecipients records for the same notification/user combination.
Use the appropriate unique index and/or business-level idempotency check.

A recommended approach is to maintain a unique business reference for the approval event, for example:

{
  type: "BUNDLE_APPROVED",
  bundleId: ObjectId("..."),
  eventId: "bundle-approval-event-id"
}

11. Error Handling

Notification failure should be handled separately from bundle approval.

Bundle approval

If bundle approval fails:

Bundle remains unapproved
No notification process is triggered

Notification failure

If notification broadcasting fails after approval:

Bundle remains approved
Recipient status becomes FAILED
failureReason is stored


The notification system should allow failed notifications to be retried without approving the bundle again.

12. API Security

The API must enforce:

accessRole = admin


at the API configuration/apiData level and through the existing authorization middleware.

A request from a non-admin user should return the project's standard unauthorized/forbidden response.

13. Acceptance Criteria
 New API is created for bundle approval.
 API is accessible only to admin users.
 accessRole is configured correctly in apiData.
 Bundle approval is persisted successfully before notifications are triggered.
 Users are filtered by the bundle's suburb.
 Bundle services are retrieved.
 Each user's service eligibility is validated.
 Users missing even one bundle service are excluded.
 Notification is created for the approved bundle.
 Recipient records are created only for eligible users.
 Message Broadcasting Service is implemented/reused.
 Notification delivery status is tracked.
 Failed notifications can be identified/retried.
 Duplicate notifications/recipients are prevented.
 Required Featuristic collections are created.
 Required indexes are created.
 Bundle approval failure does not trigger notifications.
 Notification failure does not roll back a successful bundle approval.