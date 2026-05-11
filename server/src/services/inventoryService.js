/**
 * services/inventoryService.js
 * Solex — Atomic Stock Reduction
 *
 * Current Schema:
 * sizes: [6,7,8,9]
 * stock: 200
 *
 * No per-size stock support yet.
 */

import Product from "../models/Product.model.js";

/**
 * Reduce stock
 */
export const reduceStock = async (orderItems) => {
  const ops = orderItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product,
        // Ensure enough stock exists
        stock: { $gte: item.quantity },
      },
      update: {
        $inc: { stock: -item.quantity },
      },
    },
  }));

  const result = await Product.bulkWrite(ops);

  // Ensure ALL items updated
  if (result.modifiedCount !== orderItems.length) {
    throw new Error(
      "Stock update failed — one or more items are out of stock.",
    );
  }

  return result;
};

/**
 * Restore stock
 * Used on payment failure / cancellation
 */
export const restoreStock = async (orderItems) => {
  const ops = orderItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product,
      },
      update: {
        $inc: { stock: item.quantity },
      },
    },
  }));

  return Product.bulkWrite(ops);
};
