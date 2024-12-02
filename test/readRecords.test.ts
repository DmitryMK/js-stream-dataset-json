import DatasetJson from "../src/index";
import { ItemDataObject } from "../src/interfaces/datasetJson";


test("Read the first and the last record dataset", async () => {
    const filePath = "test/data/adsl.json";

    const data = new DatasetJson(filePath);

    const result: ItemDataObject[] = [];
    let rowsCount = 0;
    for await (const row of data.readRecords({type: "object"}) as AsyncIterable<ItemDataObject>) {
        rowsCount++;

        if (rowsCount === 1 || rowsCount === data.metadata.records) {
            result.push(row);
        }
    }

    expect(result).toMatchSnapshot();
});