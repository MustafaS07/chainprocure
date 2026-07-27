# Purchase Order Asset Design

## Asset Name

PurchaseOrder

---

## Description

Represents a purchase order shared between buyer and supplier organizations
on the Hyperledger Fabric network.

---

## Asset Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purchaseOrderId | String | Yes | Unique Purchase Order ID |
| buyer | String | Yes | Buyer Organization |
| supplier | String | Yes | Supplier Organization |
| item | String | Yes | Product Name |
| quantity | Number | Yes | Ordered Quantity |
| unitPrice | Number | Yes | Price per Unit |
| totalAmount | Number | Yes | quantity × unitPrice |
| status | String | Yes | CREATED, APPROVED, REJECTED, SHIPPED, RECEIVED |
| createdBy | String | Yes | Client Identity |
| createdAt | String | Yes | ISO Timestamp |
| updatedAt | String | Yes | Last Modified |

---

## Lifecycle

CREATED

↓

APPROVED

↓

SHIPPED

↓

RECEIVED

OR

CREATED

↓

REJECTED
