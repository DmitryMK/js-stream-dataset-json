import { ItemDataArray, ItemGroupData, Data } from "interfaces/datasetJson.d";
type ItemGroupMetadata = Omit<ItemGroupData, "itemData">;
type DataMetadata = Omit<Data, "itemGroupData">;
declare class DatasetJson {
    filePath: string;
    itemGroupMetadata: ItemGroupMetadata;
    dataMetadata: DataMetadata;
    currentPointer: number;
    constructor(filePath: string);
    init(): Promise<void>;
    getMetadata(): Promise<{
        itemGroupMetadata: ItemGroupMetadata;
        dataMetadata: DataMetadata;
    }>;
    getData(start: number, length: number): Promise<ItemDataArray[]>;
}
export default DatasetJson;
//# sourceMappingURL=datasetJson.d.ts.map