import DatasetJson from "../src/index";
import { ItemDataArray } from "../src/interfaces/datasetJson";

test("Get 100 rows of dataset", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  await data.init();
  let result: ItemDataArray[] = [];
  while(data.allRowsRead !== true) {
    let rows = await data.getData({start: data.currentPosition, length: 100});
    result = result.concat(rows as ItemDataArray[]);

  }
  expect(result).toMatchSnapshot();
});


test("Get 5 rows of dataset", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  await data.init();
  const rows = await data.getData({start: 20, length: 5});
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of dataset as an object", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  await data.init();
  const rows = await data.getData({start: 20, length: 5, type: "object"});
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of dataset as an object and keep only specific variables", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  await data.init();
  const rows = await data.getData({start: 20, length: 5, type: "object", filterColumns: ["USUBJID", "TRTEDT", "STUDYID"]});
  expect(rows).toMatchSnapshot();
});
