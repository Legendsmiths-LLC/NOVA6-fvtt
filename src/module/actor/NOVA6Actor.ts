/**
 * NOVA6Actor is the default entity class for actors inside the NOVA6 system.
 */
import { ActorDataNOVA6 } from "./ActorTypes";

export class NOVA6Actor extends Actor {

}

declare global {
    interface DocumentClassConfig {
        Actor: typeof NOVA6Actor;
    }

    interface DataConfig {
        Actor: ActorDataNOVA6;
    }
}
