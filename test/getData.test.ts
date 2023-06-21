import DatasetJson from "../src/index";

test("Get 5 rows of dataset", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  await data.init();
  const rows = await data.getData(20, 5);
  expect(rows).toMatchSnapshot();
});
