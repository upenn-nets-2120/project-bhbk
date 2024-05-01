import * as fs from 'fs';
import { parse } from 'csv-parse';

export const parseLocalTsv = async (path: string) => {
    const records: any[] = [];
    const parser = fs.createReadStream(path).pipe(parse({
        delimiter: '\t',  // TSV files are tab-delimited
        columns: true,    // First line contains column headers
        skip_empty_lines: true
    }));

    for await (const record of parser) {
        records.push(record);
    }

    return records;
}