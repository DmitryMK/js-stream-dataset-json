import DatasetJson from "../src/index";

test("Get metadata", async () => {
  const filePath = "test/data/adsl.json";

  const data = new DatasetJson(filePath);
  await data.init();
  const metadata = await data.getMetadata();
  expect(metadata).toMatchSnapshot();
});
