import { Modules } from "@medusajs/framework/utils";

export default async function({ container }: any) {
  const orderModuleService = container.resolve(Modules.ORDER);
  
  const orders = await orderModuleService.listOrders({});
  if(orders.length > 0) {
      console.log(JSON.stringify(orders[0], null, 2));
  } else {
    console.log("no orders");
  }
}
