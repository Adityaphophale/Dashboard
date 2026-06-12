# EXIM System API Documentation

**Base URL**: `/api/v1`

## Authentication & Authorization

All protected endpoints require an `Authorization: Bearer <token>` header. Roles define access to specific resources.

| Endpoint | Method | Description | Roles | Request Body | Response |
|----------|--------|-------------|-------|--------------|----------|
| `/auth/login` | `POST` | User login | Public | `{ email, password }` | `{ token, user }` |
| `/auth/logout` | `POST` | User logout | Auth | None | `{ message }` |
| `/auth/forgot-password` | `POST` | Forgot password link | Public | `{ email }` | `{ message }` |
| `/auth/reset-password` | `POST` | Reset password | Public | `{ token, newPassword }` | `{ message }` |

## Users & Roles (Admin Only)

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/users` | `GET` | List all users | Admin | |
| `/users/:id` | `GET` | Get user details | Admin | |
| `/users` | `POST` | Create a new user | Admin | `{ email, firstName, lastName, roleId }` |
| `/users/:id` | `PUT` | Update user | Admin | `{ email, firstName, lastName, roleId }` |
| `/users/:id/status` | `PUT` | Toggle active status | Admin | `{ isActive }` |
| `/roles` | `GET` | List roles | Admin | |

## Customer Management

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/customers` | `GET` | List/search customers | Admin, Sales, Docs | Query: `?country=X&type=Y` |
| `/customers/:id` | `GET` | Get customer details | Admin, Sales, Docs | |
| `/customers` | `POST` | Create a customer | Admin, Sales | `{ companyName, email, country... }` |
| `/customers/:id` | `PUT` | Update a customer | Admin, Sales | `{ companyName... }` |
| `/customers/:id` | `DELETE`| Soft delete customer | Admin | |

## Product Management

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/products` | `GET` | List/search products | All Auth | Query: `?q=search&category=X` |
| `/products/:id` | `GET` | Get product details | All Auth | |
| `/products` | `POST` | Create product | Admin, Sales | `{ name, hsCode, price... }` |
| `/products/:id` | `PUT` | Update product | Admin, Sales | `{ name, hsCode, price... }` |

## Inquiries & Quotations

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/inquiries` | `GET` | List inquiries | Admin, Sales | |
| `/inquiries` | `POST` | Create inquiry | Admin, Sales | `{ customerId, productId, qty... }` |
| `/inquiries/:id/quote`| `POST` | Convert to quotation | Admin, Sales | `{ subTotal, taxTotal... }` |
| `/quotations` | `GET` | List quotations | Admin, Sales | |
| `/quotations/:id/pdf` | `GET` | Generate/Get PDF | Admin, Sales | |

## Orders (Sales Orders)

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/orders` | `GET` | List orders | All Auth | |
| `/orders/:id` | `GET` | Order details & timeline| All Auth | |
| `/orders` | `POST` | Create order manually | Admin, Sales | `{ quotationId, expectedDate... }` |
| `/orders/:id/status` | `PUT` | Update order status | Admin, Sales, Docs| `{ status }` |

## Shipments & Tracking

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/shipments` | `GET` | List shipments | All Auth | |
| `/shipments/:id` | `GET` | Shipment details | All Auth | |
| `/shipments` | `POST` | Create shipment | Docs, Admin | `{ orderId, container, bl... }` |
| `/shipments/:id/status`| `POST` | Add status history | Docs, Admin | `{ status, notes }` |

## Document Management

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/documents/:entityType/:id`| `GET` | List documents | All Auth | |
| `/documents/upload` | `POST` | Upload document | Admin, Docs, Sales| Form Data (Multipart) |
| `/documents/:id/download` | `GET` | Get S3 signed URL | All Auth | |

## Notifications

| Endpoint | Method | Description | Roles | Request Body |
|----------|--------|-------------|-------|--------------|
| `/notifications` | `GET` | List user notifications | All Auth | |
| `/notifications/:id/read` | `PUT` | Mark as read | All Auth | |
