# Business Requirements

## Project Name

ChainProcure

---

## Problem Statement

Organizations exchange purchase orders between buyers and suppliers.
Traditional systems rely on centralized databases that can be modified,
making it difficult to prove the authenticity and history of a purchase order.

The objective is to build a blockchain-based purchase order management
system using Hyperledger Fabric where all participating organizations
share a trusted ledger.

---

## Stakeholders

- Buyer Organization
- Supplier Organization
- Network Administrator

---

## Business Objectives

- Create Purchase Orders
- Approve Purchase Orders
- Reject Purchase Orders
- Ship Orders
- Receive Orders
- Track complete lifecycle
- Maintain immutable audit history

---

## Blockchain Platform

Hyperledger Fabric 2.5

---

## Channel

mychannel

---

## Organizations

Org1MSP (Buyer)

Org2MSP (Supplier)

---

## Consensus

Raft Ordering Service

---

## Ledger

World State

Blockchain Ledger

---

## Smart Contract

PurchaseOrderContract
