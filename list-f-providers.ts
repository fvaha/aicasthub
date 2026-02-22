import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const fModule = container.resolve(Modules.FULFILLMENT);
    const providers = await fModule.listFulfillmentProviders({});
    console.log(providers);
}
