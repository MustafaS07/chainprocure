'use strict';

const PurchaseOrderContract = require('./contract/PurchaseOrderContract');

/**
 * Fabric loads this file first when the chaincode container starts.
 * The `contracts` array tells fabric-shim which Contract classes this
 * package provides — you could list multiple contracts here if this
 * chaincode grew to cover more than purchase orders.
 */
module.exports.contracts = [PurchaseOrderContract];
