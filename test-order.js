const { resolve } = require("path");
const { spawnSync } = require("child_process");

const code = `
const { Modules } = require("@medusajs/framework/utils");

async function check(container) {
  const orderModuleService = container.resolve(Modules.ORDER);
  const paymentModuleService = container.resolve(Modules.PAYMENT);
  
  const orders = await orderModuleService.listOrders({}, { relations: ["payment_collections", "fulfillments"] });
  if(orders.length > 0) {
      console.log(JSON.stringify(orders[0], null, 2));
      console.log("PAYMENT COLLECTIONS:", await paymentModuleService.listPaymentCollections({}));
  } else {
    console.log("no orders");
  }
}

module.exports = async (container) => {
    await check(container);
    process.exit(0);
};
`;

const fs = require('fs');
fs.writeFileSync('medusa-script.js', code);
