#! /usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { parse } from 'csv-parse';

function getInputFile(fileName, packageName) {
    // the below condition checks if the file is CSV or not
    if(fileName.slice(-4) !== '.csv') {
        console.log(chalk.bgRed("Please enter a CSV file only!"));
        return ;
    }

    // the below condition checks for the exisitence of the CSV file
    const path = `./${fileName}`;
    if (!fs.existsSync(path)) {
        console.log(chalk.bgRed(`The file ${fileName} does not exist!`));
        return ;
    }

    fs.createReadStream(`./${fileName}`)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        console.log(row);
    })
}

program
  .version('1.0.0')
  .description("CLI to check GITHUB repo dependencies");

// this command is for taking the input
program
    .command("i <filename> <package_name>")
    .alias('input')
    .description('takes input')
    .action((filename, package_name) => {
        // console.log(`File name is ${filename} and the package is ${package_name}`)
        getInputFile(filename, package_name);
    })

// this command is for the updating part
program
    .command("update <i> <filename> <package_name>")
    .alias('u')
    .description('takes input')
    .action((input, filename, package_name) => {
        console.log(`File updated name is ${filename} and the package is ${package_name}`)
    })


program.parse(process.args);