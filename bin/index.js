#! /usr/bin/env node
import { program } from 'commander';
import { getInputFile } from './../utils/getInputFile.js'

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