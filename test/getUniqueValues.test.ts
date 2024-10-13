import DatasetJson from "../src/index";
import { ItemDataArray } from "../src/interfaces/datasetJson";

test("Get unique values of variables", async () => {
    const filePath = "test/data/adsl.json";

    const data = new DatasetJson(filePath);
    await data.init();
    const values = await data.getUniqueValues({columns: ["USUbjid", "trtedt", "STUDYID"]});
    expect(values).toMatchSnapshot();
});

test("Get 5 rows of dataset", async () => {
    const filePath = "test/data/adsl.json";

    const data = new DatasetJson(filePath);
    await data.init();
    const result: ItemDataArray[] = [];
    for await (const row of data.readRecords({length: 50})) {
        result.push(row as ItemDataArray);
    }
    expect(result).toMatchSnapshot();
});