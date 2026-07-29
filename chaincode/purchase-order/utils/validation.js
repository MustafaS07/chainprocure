'use strict';

const VALID_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'];

/**
 * Keeps the contract file clean — the contract calls these,
 * it doesn't inline validation logic itself.
 */

function validateOrderId(orderId) {
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
        throw new Error('orderId must be a non-empty string');
    }
}

function validateQuantity(quantity) {
    const q = Number(quantity);
    if (!Number.isInteger(q) || q <= 0) {
        throw new Error(`Invalid quantity: ${quantity}. Must be a positive integer.`);
    }
    return q;
}

function validateStatus(status) {
    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of ${VALID_STATUSES.join(', ')}`);
    }
}

/**
 * Fabric chaincode must be deterministic — every endorsing peer has to
 * compute the exact same value. new Date() would differ slightly
 * between peers, so we always derive timestamps from the transaction
 * itself via ctx.stub.getTxTimestamp(), not wall-clock time.
 */
function getTxTimestampISO(ctx) {
    const ts = ctx.stub.getTxTimestamp();
    const millis = ts.seconds.low * 1000 + Math.floor(ts.nanos / 1000000);
    return new Date(millis).toISOString();
}

module.exports = {
    VALID_STATUSES,
    validateOrderId,
    validateQuantity,
    validateStatus,
    getTxTimestampISO,
};
