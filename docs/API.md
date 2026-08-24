# FestSphere API Documentation

## 1. Conventions

- Base URL: /api/v1
- Authentication: Bearer token in Authorization header
- Response format: JSON
- Error format: { error: { code, message, details } }

## 2. Authentication Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | /auth/register | Register a new user | No | { fullName, email, password, collegeId, role } | User object and token | 201, 400, 409 |
| POST | /auth/login | Login user | No | { email, password } | User object and token | 200, 401 |
| POST | /auth/refresh | Refresh access token | No | { refreshToken } | New access token | 200, 401 |
| POST | /auth/forgot-password | Send password reset email | No | { email } | Success message | 200, 404 |
| POST | /auth/reset-password | Reset password | No | { token, newPassword } | Success message | 200, 400 |
| GET | /auth/me | Get current authenticated user | Yes | None | User profile | 200, 401 |

## 3. Users Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- | --- | --- |
| GET | /users | List users | Yes | None | Paginated users | 200 |
| GET | /users/:id | Get user by ID | Yes | None | User profile | 200, 404 |
| PATCH | /users/:id | Update user profile | Yes | { fullName, phone, avatarUrl, collegeId } | Updated user | 200, 403 |
| DELETE | /users/:id | Deactivate user | Yes | None | Success message | 200, 403 |

## 4. Events Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| GET | /events | List public events | No | Query filters | Paginated events | 200 |
| GET | /events/:id | Get event details | No | None | Event object | 200, 404 |
| POST | /events | Create event | Yes | Event payload | Created event | 201, 403 |
| PATCH | /events/:id | Update event | Yes | Event payload | Updated event | 200, 403 |
| DELETE | /events/:id | Delete or archive event | Yes | None | Success message | 200, 403 |

## 5. Teams Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| POST | /teams | Create a new team | Yes | { eventId, teamName, memberIds } | Team object | 201 |
| GET | /teams/:id | Get team details | Yes | None | Team details | 200, 404 |
| PATCH | /teams/:id | Update team info | Yes | { teamName, members } | Updated team | 200 |
| POST | /teams/:id/invite | Invite member to team | Yes | { email } | Invite status | 200 |
| DELETE | /teams/:id | Remove team | Yes | None | Success message | 200 |

## 6. Registrations Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| POST | /registrations | Register for an event | Yes | { eventId, registrationType, teamId } | Registration object | 201, 400 |
| GET | /registrations/me | Get current user's registrations | Yes | None | Registration list | 200 |
| GET | /registrations/:id | Get registration by ID | Yes | None | Registration object | 200, 404 |
| PATCH | /registrations/:id | Update registration status | Yes | { status, checkedInAt } | Updated registration | 200 |
| DELETE | /registrations/:id | Cancel registration | Yes | None | Success message | 200 |

## 7. Payments Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| POST | /payments/order | Create payment order | Yes | { registrationId, amount } | Payment order details | 201 |
| POST | /payments/verify | Verify payment callback | Yes | { orderId, paymentId, signature } | Verification result | 200 |
| GET | /payments/:id | Get payment status | Yes | None | Payment object | 200, 404 |
| GET | /payments/me | Get current user's payments | Yes | None | Payment list | 200 |

## 8. Analytics Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| GET | /analytics/overview | Get platform overview | Yes | Query filters | KPI summary | 200 |
| GET | /analytics/events/:id | Get event analytics | Yes | None | Event stats | 200 |
| GET | /analytics/revenue | Get revenue metrics | Yes | Date range filters | Revenue report | 200 |
| GET | /analytics/attendance | Get attendance report | Yes | Event filters | Attendance data | 200 |

## 9. Volunteers Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| GET | /volunteers/assignments | List volunteer assignments | Yes | None | Assigned tasks | 200 |
| POST | /volunteers/verify-qr | Verify QR ticket | Yes | { qrTicketId, eventId } | Verification result | 200 |
| PATCH | /volunteers/attendance/:id | Mark attendance | Yes | { status } | Updated registration | 200 |

## 10. Announcements Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| GET | /announcements | List announcements | No | Filters | Announcement list | 200 |
| POST | /announcements | Create announcement | Yes | { title, body, audience, eventId } | Announcement object | 201 |
| PATCH | /announcements/:id | Update announcement | Yes | Announcement payload | Updated announcement | 200 |
| DELETE | /announcements/:id | Remove announcement | Yes | None | Success message | 200 |

## 11. Certificates Endpoints

| Method | Route | Description | Auth Required | Request Body | Response | Status Codes |
| --- | --- | --- | --- |
| GET | /certificates/me | List issued certificates for current user | Yes | None | Certificate list | 200 |
| POST | /certificates/generate | Generate certificate | Yes | { registrationId } | Certificate object | 201 |
| GET | /certificates/:id | Get certificate | Yes | None | Certificate file metadata | 200, 404 |
