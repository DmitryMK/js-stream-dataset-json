import fs from "fs";
import {
  ItemDataArray,
  ItemDescription,
  ItemGroupData,
  Data,
} from "interfaces/datasetJson.d";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import JSONStream from "JSONStream";

type ItemGroupMetadata = Omit<ItemGroupData, "itemData">;
type DataMetadata = Omit<Data, "itemGroupData">;

// Main class for dataset JSON;
class DatasetJson {
  // Path to the file;
  filePath: string;

  // Item Group metadata;
  itemGroupMetadata: ItemGroupMetadata;
  // Item Group metadata;
  dataMetadata: DataMetadata;

  // Current position in the file;
  currentPointer: number;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.currentPointer = 0;
    this.itemGroupMetadata = {
      records: -1,
      name: "",
      label: "",
      items: [],
    };

    this.dataMetadata = {
      studyOID: "",
      metaDataVersionOID: "",
    };

    // Check if file exists;
    if (!fs.existsSync(filePath)) {
      throw new Error(`Could not read file ${filePath}`);
    }
  }

  async init() {
    const metadata = await this.getMetadata();
    this.itemGroupMetadata = metadata.itemGroupMetadata;
    this.dataMetadata = metadata.dataMetadata;
  }

  async getMetadata(): Promise<{
    itemGroupMetadata: ItemGroupMetadata;
    dataMetadata: DataMetadata;
  }> {
    return new Promise((resolve, reject) => {
      const itemGroupMetadata: ItemGroupMetadata = {
        records: -1,
        name: "",
        label: "",
        items: [],
      };
      const dataMetadata: DataMetadata = {
        studyOID: "",
        metaDataVersionOID: "",
      };
      const parsedItemGroupMetadata = {
        records: false,
        name: false,
        label: false,
        items: false,
      };
      const parsedDataMetadata = {
        studyOID: false,
        metaDataVersionOID: false,
        metaDataRef: false,
      };

      const checkAttributesParsed = (
        item: { [name: string]: boolean },
        optionalAttributes: string[] = []
      ): boolean => {
        return Object.keys(item)
          .filter((key) => !optionalAttributes.includes(key))
          .every((key) => item[key] === true);
      };

      const stream = fs.createReadStream(this.filePath, {
        encoding: "utf8",
      });
      stream
        .pipe(
          JSONStream.parse(
            [
              { recurse: true },
              /name|label|items|records|metaDataVersionOID|studyOID|metaDataRef|fileOID/,
            ],
            (data: string, nodePath: string) => {
              return { path: nodePath, value: data };
            }
          )
        )
        .on("end", () => {
          if (
            !checkAttributesParsed(parsedItemGroupMetadata) ||
            !checkAttributesParsed(parsedDataMetadata, ["metaDataRef"])
          ) {
            reject(new Error("Could not find required metadata elements"));
          }
          resolve({ itemGroupMetadata, dataMetadata });
        })
        .on(
          "data",
          (data: {
            path: string;
            value: string | number | Array<ItemDescription>;
          }) => {
            const key = data.path[data.path.length - 1];

            if (Object.keys(parsedItemGroupMetadata).includes(key)) {
              itemGroupMetadata[key as "name"] = data.value as string;
              parsedItemGroupMetadata[key as keyof ItemGroupMetadata] = true;
            }

            if (Object.keys(parsedDataMetadata).includes(key)) {
              dataMetadata[key as keyof DataMetadata] = data.value as string;
              parsedDataMetadata[key as keyof DataMetadata] = true;
            }

            // Check if all required elements were parsed
            if (
              checkAttributesParsed(parsedItemGroupMetadata) &&
              checkAttributesParsed(parsedDataMetadata, ["metaDataRef"])
            ) {
              resolve({ itemGroupMetadata, dataMetadata });
              stream.destroy();
            }
          }
        );
    });
  }

  async getData(start: number, length: number): Promise<ItemDataArray[]> {
    return new Promise((resolve) => {
      const stream = fs.createReadStream(this.filePath, {
        encoding: "utf8",
      });
      const currentData: ItemDataArray[] = [];
      let currentPosition = 0;
      stream
        .pipe(
          JSONStream.parse(
            [/clinicalData|referenceData/, true, true, /itemData/, true],
            (data: string, nodePath: string) => {
              return { path: nodePath, value: data };
            }
          )
        )
        .on("end", () => {
          resolve(currentData);
        })
        .on("data", (data: { path: string; value: ItemDataArray }) => {
          currentPosition += 1;
          if (currentPosition >= start && currentPosition < start + length) {
            currentData.push(data.value);
          } else if (currentPosition === start + length + 1) {
            resolve(currentData);
            stream.destroy();
          }
        });
    });
  }
}

export default DatasetJson;
