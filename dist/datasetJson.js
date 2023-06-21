"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const JSONStream_1 = __importDefault(require("JSONStream"));
// Main class for dataset JSON;
class DatasetJson {
    constructor(filePath) {
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
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`Could not read file ${filePath}`);
        }
    }
    async init() {
        const metadata = await this.getMetadata();
        this.itemGroupMetadata = metadata.itemGroupMetadata;
        this.dataMetadata = metadata.dataMetadata;
    }
    async getMetadata() {
        return new Promise((resolve, reject) => {
            const itemGroupMetadata = {
                records: -1,
                name: "",
                label: "",
                items: [],
            };
            const dataMetadata = {
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
            const checkAttributesParsed = (item, optionalAttributes = []) => {
                return Object.keys(item)
                    .filter((key) => !optionalAttributes.includes(key))
                    .every((key) => item[key] === true);
            };
            const stream = fs_1.default.createReadStream(this.filePath, {
                encoding: "utf8",
            });
            stream
                .pipe(JSONStream_1.default.parse([
                { recurse: true },
                /name|label|items|records|metaDataVersionOID|studyOID|metaDataRef|fileOID/,
            ], (data, nodePath) => {
                return { path: nodePath, value: data };
            }))
                .on("end", () => {
                if (!checkAttributesParsed(parsedItemGroupMetadata) ||
                    !checkAttributesParsed(parsedDataMetadata, ["metaDataRef"])) {
                    reject(new Error("Could not find required metadata elements"));
                }
                resolve({ itemGroupMetadata, dataMetadata });
            })
                .on("data", (data) => {
                const key = data.path[data.path.length - 1];
                if (Object.keys(parsedItemGroupMetadata).includes(key)) {
                    itemGroupMetadata[key] = data.value;
                    parsedItemGroupMetadata[key] = true;
                }
                if (Object.keys(parsedDataMetadata).includes(key)) {
                    dataMetadata[key] = data.value;
                    parsedDataMetadata[key] = true;
                }
                // Check if all required elements were parsed
                if (checkAttributesParsed(parsedItemGroupMetadata) &&
                    checkAttributesParsed(parsedDataMetadata, ["metaDataRef"])) {
                    resolve({ itemGroupMetadata, dataMetadata });
                    stream.destroy();
                }
            });
        });
    }
    async getData(start, length) {
        return new Promise((resolve) => {
            const stream = fs_1.default.createReadStream(this.filePath, {
                encoding: "utf8",
            });
            const currentData = [];
            let currentPosition = 0;
            stream
                .pipe(JSONStream_1.default.parse([/clinicalData|referenceData/, true, true, /itemData/, true], (data, nodePath) => {
                return { path: nodePath, value: data };
            }))
                .on("end", () => {
                resolve(currentData);
            })
                .on("data", (data) => {
                currentPosition += 1;
                if (currentPosition >= start && currentPosition < start + length) {
                    currentData.push(data.value);
                }
                else if (currentPosition === start + length + 1) {
                    resolve(currentData);
                    stream.destroy();
                }
            });
        });
    }
}
exports.default = DatasetJson;
//# sourceMappingURL=datasetJson.js.map