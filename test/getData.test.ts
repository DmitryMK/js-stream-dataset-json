import DatasetJson from "../src/index";


test("Get 5 rows of dataset", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  const rows = await data.getData({start: 20, length: 5});
  expect(rows.length).toBe(5);
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of dataset as an object", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  const rows = await data.getData({start: 20, length: 5, type: "object"});
  expect(rows.length).toBe(5);
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of dataset as an object and keep only specific variables", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  const rows = await data.getData({start: 20, length: 5, type: "object", filterColumns: ["USUBJID", "TRTEDT", "STUDYID"]});
  expect(rows.length).toBe(5);
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of NDJSON dataset", async () => {
  const filePath = "test/data/adsl.ndjson";

  const data = new DatasetJson(filePath);
  const rows = await data.getData({start: 20, length: 5});
  expect(rows.length).toBe(5);
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of NDJSON dataset as an object", async () => {
  const filePath = "test/data/adsl.ndjson";

  const data = new DatasetJson(filePath);
  const rows = await data.getData({start: 20, length: 5, type: "object"});
  expect(rows.length).toBe(5);
  expect(rows).toMatchSnapshot();
});

test("Get 5 rows of NDJSON dataset as an object and keep only specific variables", async () => {
  const filePath = "test/data/adsl.ndjson";

  const data = new DatasetJson(filePath);
  const rows = await data.getData({start: 20, length: 5, type: "object", filterColumns: ["USUBJID", "TRTEDT", "STUDYID"]});
  expect(rows.length).toBe(5);
  expect(rows).toMatchSnapshot();
});
