import { NOVA6ItemData } from "./ItemTypes";

export class NOVA6Item extends Item {
    prepareData() {
        super.prepareData();

        // Let every itemType prepare itself
        if (this.actor?.data) {
            if (CONFIG.NOVA6.itemClasses[this.data.type]) {
                CONFIG.NOVA6.itemClasses[this.data.type].prepareItemData(this.data, this);
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
