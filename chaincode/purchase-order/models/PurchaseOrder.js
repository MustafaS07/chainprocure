'use strict';

/**
 * PurchaseOrder — plain data model.
 * No Fabric/ctx/stub code belongs in this file. This is intentionally
 * "dumb" — just a shape for the data we store on the ledger, similar to
 * a Mongoose schema or a Java POJO.
 *
 * Field choices are aligned to the real RealWare Soft Demand schema
 * (Order Number, Material ID, Quantity, etc.) rather than invented
 * placeholder fields, so this can grow into the real project later
 * instead of being throwaway learning code.
 */
class PurchaseOrder {
    constructor(orderId, buyerOrgId, supplierOrgId, materialId, quantity, status, createdAt) {
        this.orderId = orderId;             // unique key, e.g. "PO1001"
        this.buyerOrgId = buyerOrgId;        // e.g. "Org1MSP" or a real customer ID
        this.supplierOrgId = supplierOrgId;  // e.g. "Org2MSP" or a real supplier ID
        this.materialId = materialId;        // links to Material Master (future contract)
        this.quantity = quantity;            // integer
        this.status = status;                // "Pending" | "Confirmed" | "Shipped" | "Completed" | "Cancelled"
        this.createdAt = createdAt;          // ISO string, from ctx.stub.getTxTimestamp() — deterministic
        this.updatedAt = createdAt;          // starts equal to createdAt, changes on updates
        this.history = [];                   // append-only log of status changes
        this.docType = 'purchaseOrder';      // lets CouchDB rich queries filter by type later
    }
}

module.exports = PurchaseOrder;
