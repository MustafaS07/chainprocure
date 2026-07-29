'use strict';

const { Contract } = require('fabric-contract-api');
const PurchaseOrder = require('../models/PurchaseOrder');
const {
    validateOrderId,
    validateQuantity,
    validateStatus,
    getTxTimestampISO,
} = require('../utils/validation');

/**
 * Every Fabric contract extends the Contract base class from
 * fabric-contract-api. This is what lets fabric-shim discover your
 * functions and route peer/SDK calls (submitTransaction/evaluateTransaction)
 * to the right method by name.
 *
 * ctx (the first argument to every function) is the "transaction context" —
 * it carries ctx.stub (talks to the ledger), ctx.clientIdentity (who's
 * calling), and per-transaction state. You never construct it yourself;
 * Fabric hands it to every function automatically.
 */
class PurchaseOrderContract extends Contract {

    constructor() {
        // The string here becomes the contract's namespace — matters if
        // you ever host multiple contracts in one chaincode package.
        super('PurchaseOrderContract');
    }

    async InitLedger(ctx) {
        console.info('PurchaseOrderContract: ledger initialized, no seed data.');
    }

    /**
     * MILESTONE — PurchaseOrderExists()
     * Built first because almost every other function needs it:
     * Create must confirm the ID is NOT already used;
     * Read/Update/Delete must confirm the ID DOES exist.
     *
     * ctx.stub.getState(key) returns a Buffer. An empty/zero-length
     * buffer means "no such key" — Fabric doesn't throw for missing
     * keys, it just returns nothing, so we check length ourselves.
     */
    async PurchaseOrderExists(ctx, orderId) {
        validateOrderId(orderId);
        const data = await ctx.stub.getState(orderId);
        return data && data.length > 0;
    }

    /**
     * MILESTONE — CreatePurchaseOrder()
     * This is a WRITE transaction — it will go through the full
     * proposal -> endorse -> order -> validate -> commit flow.
     * SDK/CLI callers must use submitTransaction (not evaluateTransaction).
     *
     * Business rule: orderId must be unique — mirrors the real Soft Demand
     * duplicate-prevention rule from your project reference doc.
     */
    async CreatePurchaseOrder(ctx, orderId, buyerOrgId, supplierOrgId, materialId, quantity) {
        validateOrderId(orderId);
        const qty = validateQuantity(quantity);

        const exists = await this.PurchaseOrderExists(ctx, orderId);
        if (exists) {
            throw new Error(`Purchase order ${orderId} already exists. Cannot overwrite.`);
        }

        const timestamp = getTxTimestampISO(ctx);
        const po = new PurchaseOrder(
            orderId,
            buyerOrgId,
            supplierOrgId,
            materialId,
            qty,
            'Pending',
            timestamp
        );

        // putState is deterministic — every endorsing peer writes the
        // exact same bytes, which is required for the read/write set
        // comparison during validation to succeed.
        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(po)));

        // Lets an external SDK application react (e.g. notify the supplier)
        // without polling — mirrors the OrderCreated event pattern from
        // softdemandNode in your existing project.
        ctx.stub.setEvent('PurchaseOrderCreated', Buffer.from(orderId));

        return JSON.stringify(po);
    }

    /**
     * MILESTONE — ReadPurchaseOrder()
     * A READ-only transaction — SDK callers should use
     * evaluateTransaction, not submitTransaction, since this never
     * writes to the ledger and doesn't need ordering/consensus.
     */
    async ReadPurchaseOrder(ctx, orderId) {
        validateOrderId(orderId);
        const data = await ctx.stub.getState(orderId);
        if (!data || data.length === 0) {
            throw new Error(`Purchase order ${orderId} does not exist`);
        }
        return data.toString();
    }

    /**
     * MILESTONE — UpdateStatus()
     * Preserves history before overwriting — same pattern as
     * updateProductionPlan in your existing productionplanNode contract:
     * push the old state to a history[] array, then apply the change.
     */
    async UpdateStatus(ctx, orderId, newStatus) {
        validateOrderId(orderId);
        validateStatus(newStatus);

        const existing = await ctx.stub.getState(orderId);
        if (!existing || existing.length === 0) {
            throw new Error(`Purchase order ${orderId} does not exist`);
        }

        const po = JSON.parse(existing.toString());
        const timestamp = getTxTimestampISO(ctx);

        po.history.push({
            status: po.status,
            updatedAt: po.updatedAt,
        });

        po.status = newStatus;
        po.updatedAt = timestamp;

        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(po)));
        ctx.stub.setEvent('PurchaseOrderStatusUpdated', Buffer.from(JSON.stringify({ orderId, newStatus })));

        return JSON.stringify(po);
    }

    /**
     * MILESTONE — DeletePurchaseOrder()
     * deleteState removes the key from world state. The transaction
     * itself is still permanently recorded in the blockchain log —
     * "delete" only affects the current-value view, not history.
     */
    async DeletePurchaseOrder(ctx, orderId) {
        validateOrderId(orderId);
        const exists = await this.PurchaseOrderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`Purchase order ${orderId} does not exist`);
        }
        await ctx.stub.deleteState(orderId);
        return JSON.stringify({ orderId, deleted: true });
    }

    /**
     * MILESTONE — GetAllPurchaseOrders()
     * Range query over the entire key space. getStateByRange('', '')
     * means "start from the beginning, no end limit" — returns every
     * key in this chaincode's namespace. Fine for learning/small data;
     * for production with lots of orders you'd want composite keys +
     * getStateByPartialCompositeKey, or a CouchDB rich query, instead.
     */
    async GetAllPurchaseOrders(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];

        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                try {
                    const record = JSON.parse(res.value.value.toString('utf8'));
                    results.push(record);
                } catch (err) {
                    // Skip any non-JSON keys that might exist in this namespace
                }
            }
            res = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(results);
    }
}

module.exports = PurchaseOrderContract;
