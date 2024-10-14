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