import fs from "fs";
import fsPromises from "fs/promises";
import {
    ItemDataArray,
    ItemDescription,
    ItemGroupData,
    Data,
} from "interfaces/datasetJson.d";
import JSONStream from "JSONStream";

type ItemGroupMetadata = Omit<ItemGroupData, "itemData">;
type DataMetadata = Omit<Data, "itemGroupData">;
interface UniqueValues {
    [name: string]: any[];
}

// Main class for dataset JSON;
class DatasetJson {
    // Path to the file;
    filePath: string;
    // Statistics about the file;
    stats: fs.Stats;
    // Item Group metadata;
    itemGroupMetadata: ItemGroupMetadata;
    // Item Group metadata;
    dataMetadata: DataMetadata;

    // Current position in the file;
    currentPosition: number;
    // Streat
    stream: fs.ReadStream;

    /**
     * Read observations.
     * @constructor
     * @param filePath - Path to the file.
     */
    constructor(filePath: string) {
        this.filePath = filePath;
        this.currentPosition = 0;

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
        this.stats = fs.statSync(this.filePath);
        this.stream = fs.createReadStream(this.filePath, {
            encoding: "utf8",
        });
    }

    /**
     * Initialize a dataset
     */
    async init() {
        const metadata = await this.getMetadata();
        this.itemGroupMetadata = metadata.itemGroupMetadata;
        this.dataMetadata = metadata.dataMetadata;
    }

    /**
     * Check if the file was modified
     * @return True if file has changed, otherwise false.
     */
    async fileChanged(): Promise<boolean> {
        const stats = await fsPromises.stat(this.filePath);
        if (stats.mtimeMs !== this.stats.mtimeMs) {
            return true;
        }
        return false;
    }

    /**
     * Auxilary function to verify if required elements are parsed;
     * @return True if all required attributes are present, otherwise false.
     */
    #checkAttributesParsed = (
        item: { [name: string]: boolean },
        optionalAttributes: string[] = []
    ): boolean => {
        return Object.keys(item)
            .filter((key) => !optionalAttributes.includes(key))
            .every((key) => item[key] === true);
    };

    /**
     * Get Dataset-JSON metadata
     * @return An object with file metadata.
     */
    async getMetadata(): Promise<{
        itemGroupMetadata: ItemGroupMetadata;
        dataMetadata: DataMetadata;
    }> {
        // If the file did not change, use the metadata obtained during initialization;
        if (
            !(await this.fileChanged()) &&
            this.itemGroupMetadata.records != -1
        ) {
            return {
                itemGroupMetadata: this.itemGroupMetadata,
                dataMetadata: this.dataMetadata,
            };
        } else {
            return new Promise((resolve, reject) => {
                // Metadata for ItemGroup
                const itemGroupMetadata: ItemGroupMetadata = {
                    records: -1,
                    name: "",
                    label: "",
                    items: [],
                };
                const parsedItemGroupMetadata = {
                    records: false,
                    name: false,
                    label: false,
                    items: false,
                };

                // Metadata for ReferenceData/ClinicalData object;
                const dataMetadata: DataMetadata = {
                    studyOID: "",
                    metaDataVersionOID: "",
                };
                const parsedDataMetadata = {
                    studyOID: false,
                    metaDataVersionOID: false,
                    metaDataRef: false,
                };

                // Restart stream
                if (this.currentPosition !== 0 || this.stream.destroyed) {
                    if (!this.stream.destroyed) {
                        this.stream.destroy();
                    }
                    this.stream = fs.createReadStream(this.filePath, {
                        encoding: "utf8",
                    });
                }

                this.stream
                    .pipe(
                        JSONStream.parse(
                            [
                                { recurse: true },
                                /name|label|items|records|metaDataVersionOID|studyOID|metaDataRef|fileOID|itemData/,
                            ],
                            (data: string, nodePath: string) => {
                                return { path: nodePath, value: data };
                            }
                        )
                    )
                    .on("end", () => {
                        // Check if all required attributes are parsed after the file is fully loaded;
                        if (
                            !this.#checkAttributesParsed(
                                parsedItemGroupMetadata
                            )
                        ) {
                            reject(
                                new Error(
                                    "Could not find required metadata elements"
                                )
                            );
                        }
                        resolve({ itemGroupMetadata, dataMetadata });
                    })
                    .on(
                        "data",
                        (data: {
                            path: string;
                            value: string | number | Array<ItemDescription>;
                        }) => {
                            // Element which is emitted;
                            const key = data.path[data.path.length - 1];

                            // ItemGroupMetadata attributes;
                            if (
                                Object.keys(parsedItemGroupMetadata).includes(
                                    key
                                )
                            ) {
                                itemGroupMetadata[key as "name"] =
                                    data.value as string;
                                parsedItemGroupMetadata[
                                    key as keyof ItemGroupMetadata
                                ] = true;
                            }

                            // DataMetadata attributes;
                            if (Object.keys(parsedDataMetadata).includes(key)) {
                                dataMetadata[key as keyof DataMetadata] =
                                    data.value as string;
                                parsedDataMetadata[key as keyof DataMetadata] =
                                    true;
                            }

                            // Check if all required elements were parsed when the itemData is reached
                            if (
                                key === "itemData" &&
                                this.#checkAttributesParsed(
                                    parsedItemGroupMetadata
                                )
                            ) {
                                resolve({ itemGroupMetadata, dataMetadata });
                                this.stream.destroy();
                            }
                        }
                    );
            });
        }
    }

    /**
     * Read observations.
     * @param start - The first row number to read.
     * @param length - The number of records to read.
     * @return An array of observations.
     */
    async getData(start: number, length?: number): Promise<ItemDataArray[]> {
        return new Promise((resolve, reject) => {
            // Validate parameters
            if (length === 0 || start < 0) {
                reject(new Error("Invalid parameter values"));
            }
            // If possible, continue reading existing stream, otherwise recreate it.
            let currentPosition = this.currentPosition;
            if (this.stream.destroyed || currentPosition > start) {
                if (!this.stream.destroyed) {
                    this.stream.destroy();
                }
                this.stream = fs.createReadStream(this.filePath, {
                    encoding: "utf8",
                });
                currentPosition = 0;
            }

            const currentData: ItemDataArray[] = [];

            this.stream
                .pipe(
                    JSONStream.parse(
                        [
                            /clinicalData|referenceData/,
                            true,
                            true,
                            /itemData/,
                            true,
                        ],
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
                    if (
                        length === undefined ||
                        (currentPosition >= start &&
                            currentPosition < start + length)
                    ) {
                        currentData.push(data.value);
                    } else if (currentPosition === start + length + 1) {
                        resolve(currentData);
                        this.currentPosition = currentPosition;
                        this.stream.pause();
                    }
                });
        });
    }

    /**
     * Get unique values observations.
     * @param vars - The list of variables for which to obtain the unique observations.
     * @param data - The data to scan - result of getData() method.
     * @param limit - The maximum number of values to store. 0 - no limit.
     * @return An array of observations.
     */
    getUniqueValues(
        vars: string[],
        data: ItemDataArray[],
        limit: number = 100
    ): UniqueValues {
        let result: UniqueValues = {};

        // Get array ids for the variables
        let varIds: number[] = [];
        let dataVars = this.itemGroupMetadata.items.map((item) => item.name);
        varIds = vars
            .map((variable) => dataVars.indexOf(variable))
            .filter((id) => id !== undefined);

        varIds.forEach((id) => {
            result[vars[id]] = [];
        });

        // Get unique values
        data.forEach((row) => {
            varIds.forEach((id) => {
                if (
                    (limit === 0 || result[vars[id]].length <= limit) &&
                    row[id] !== undefined &&
                    result[vars[id]].includes(row[id])
                ) {
                    result[vars[id]].push(row[id]);
                }
            });
        });

        // Sort result
        Object.keys(result).forEach((key) => {
            result[key].sort();
        });

        return result;
    }
}

export default DatasetJson;
