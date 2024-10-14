# js-stream-dataset-json
*js-stream-dataset-json* is a TypeScript library for streaming and processing CDISC Dataset-JSON files. It provides functionalities to read data and metadata from Dataset-JSON files.

Supported Dataset-JSON versions: 1.1

## Features
* Stream Dataset-JSON files
* Extract metadata from Dataset-JSON files
* Read observations as an iterable
* Get unique values from observations

## Installation
Install the library using npm:

```sh
npm install js-stream-dataset-json
```

## Usage
### Creating Dataset-JSON instance
```TypeScript
import DatasetJson from 'js-stream-dataset-json';

dataset = new DatasetJSON('/path/to/dataset.json')
```
### Getting Metadata
```TypeScript
const metadata = await dataset.getMetadata();
```
### Reading Observations
```TypeScript
// Read first 500 records of a dataset
const data = await dataset.getData({start: 0, length: 500})
```

### Reading Observations as iterable
```TypeScript
// Read dataset starting from position 10 (11th record in the dataset)
for await (const record of dataset.readRecords({start: 10, filterColumns: ["studyId", "uSubjId"], type: "object"})) {
    console.log(record);
}
```

### Getting Unique Values
```TypeScript
const uniqueValues = await dataset.getUniqueValues({ columns: ["studyId", "uSubjId"], limit: 100 });
```

## Methods

### `getMetadata`

Returns the metadata of the Dataset-JSON file.

#### Returns

- `Promise<Metadata>`: A promise that resolves to the metadata of the dataset.

#### Example

```typescript
const metadata = await dataset.getMetadata();
console.log(metadata);
```

### `getData`

Reads observations from the dataset.

#### Parameters

- `props` (object): An object containing the following properties:
  - `start` (number): The starting position for reading data.
  - `length` (number, optional): The number of records to read. Defaults to reading all records.
  - `type` (DataType, optional): The type of the returned object ("array" or "object"). Defaults to "array".
  - `filterColumns` (string[], optional): The list of columns to return when type is "object". If empty, all columns are returned.

#### Returns

- `Promise<(ItemDataArray | ItemDataObject)[]>`: A promise that resolves to an array of data records.

#### Example

```typescript
const data = await dataset.getData({ start: 0, length: 500, type: "object", filterColumns: ["studyId", "uSubjId"] });
console.log(data);
```

### `readRecords`

Reads observations as an iterable.

#### Parameters

- `props` (object, optional): An object containing the following properties:
  - `start` (number, optional): The starting position for reading data. Defaults to 0.
  - `bufferLength` (number, optional): The number of records to read. Defaults to 1000.
  - `type` (DataType, optional): The type of data to return ("array" or "object"). Defaults to "array".
  - `filterColumns` (string[], optional): An array of column names to include in the returned data.

#### Returns

- `AsyncGenerator<ItemDataArray | ItemDataObject, void, undefined>`: An async generator that yields data records.

#### Example

```typescript
for await (const record of dataset.readRecords({ start: 10, filterColumns: ["studyId", "uSubjId"], type: "object" })) {
    console.log(record);
}
```

### `getUniqueValues`

Gets unique values for variables.

#### Parameters

- `props` (object): An object containing the following properties:
  - `columns` (string[]): An array of column names to get unique values for.
  - `limit` (number, optional): The maximum number of unique values to return for each column. Defaults to 100.
  - `bufferLength` (number, optional): The buffer length for reading data. Defaults to 1000.
  - `sort` (boolean, optional): Whether to sort the unique values. Defaults to true.

#### Returns

- `Promise<UniqueValues>`: A promise that resolves to an object containing unique values for the specified columns.

#### Example

```typescript
const uniqueValues = await dataset.getUniqueValues({
    columns: ["studyId", "uSubjId"],
    limit: 100,
    bufferLength: 1000,
    sort: true
});
console.log(uniqueValues);
```

----

## Running Tests
Run the tests using Jest:
```sh
npm test
```

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Author
Dmitry Kolosov

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

For more details, refer to the source code and the documentation.