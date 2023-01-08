/**
 * NOVA6Actor is the default entity class for actors inside the NOVA6 system.
 */
import { ActorDataNOVA6 } from "./ActorTypes";

import defaultItems from "../../../system/data/en/default.json";

export class NOVA6Actor extends Actor {
    /** @override */
    protected async _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

        if (data.items.length) {
            return;
        }

        // Add all default items
        const itemsToCreate: any = defaultItems.content;

        // @ts-ignore
        const aspects = await game?.packs.get("nova6.aspects").getDocuments();
        for (const aspectName of defaultItems.packs.aspects) {
            const packItem = aspects.find((aspect) => aspect.name === aspectName);

            if (packItem) {
                itemsToCreate.push(packItem);
            }
        }

        // @ts-ignore
        const assets = await game?.packs.get("nova6.assets").getDocuments();
        for (const assetName of defaultItems.packs.assets) {
            const packItem = assets.find((aspect) => aspect.name === assetName);

            if (packItem) {
                itemsToCreate.push(packItem);
            }
        }

        this.createEmbeddedDocuments("Item", itemsToCreate);
    }
}

declare global {
    interface DocumentClassConfig {
        Actor: typeof NOVA6Actor;
    }

    interface DataConfig {
        Actor: ActorDataNOVA6;
    }
}
