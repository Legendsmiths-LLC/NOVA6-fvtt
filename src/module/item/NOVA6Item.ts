import { NOVA6ItemData } from "./ItemTypes";

export class NOVA6Item extends Item {
    prepareData() {
        super.prepareData();

        // Let every itemType prepare itself
        // @ts-ignore
        if (this.actor?.system) {
            // @ts-ignore
            if (CONFIG.NOVA6.itemClasses[this.type]) {
                // @ts-ignore
                CONFIG.NOVA6.itemClasses[this.type].prepareItemData(this);
            }
        }
    }
}

declare global {
    interface DocumentClassConfig {
        Item: typeof NOVA6Item;
    }

    interface DataConfig {
        Item: NOVA6ItemData;
    }
}
