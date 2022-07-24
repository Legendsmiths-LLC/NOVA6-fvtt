/**
 * NOVA6Actor is the default entity class for actors inside the NOVA6 system.
 */
import { ActorDataNOVA6 } from "./ActorTypes";

import defaultItems from "../../../system/data/en/default.json";

export class NOVA6Actor extends Actor {

    /** @override */
    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

        // Create default aspects
        this.createEmbeddedDocuments('Item', defaultItems.content.aspects);

        // Create default skills
        this.createEmbeddedDocuments('Item', defaultItems.content.skills);

        // Create default stress track
        this.createEmbeddedDocuments('Item', defaultItems.content.stress);
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
