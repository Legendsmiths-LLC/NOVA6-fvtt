/**
 * NOVA6Actor is the default entity class for actors inside the NOVA6 system.
 */
import { ActorDataNOVA6 } from "./ActorTypes";

import defaultItems from "../../../system/data/en/default.json";

export class NOVA6Actor extends Actor {
    /** @override */
    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

        for (const itemType in defaultItems.content) {
            this.createEmbeddedDocuments("Item", defaultItems.content[itemType]);
        }
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
