import fs from 'fs';
import { parse } from 'fast-csv';
import { fileInfo } from './fileInfo.js';
import { githubRepoData } from './getGitHubRepoData.js';

export const getInputFile = async(fileName, packageV) => {
    const { packageName, packageVersion } = await fileInfo(fileName, packageV);

    // the below code is parsing the given CSV file and getting data in an array
    let rows = []
    fs.createReadStream(`./${fileName}`)
    .pipe(parse({ headers: true }))
    .on('error', error => console.error(error))
    .on("data", row => {
        rows.push(row);
    })
    .on('end', rowCount => {
        console.log(`Parsed ${rowCount} rows`);
        githubRepoData(rows, packageName, packageVersion);
    });
}