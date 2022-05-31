import fs from 'fs';
import chalk from 'chalk';

export const fileInfo = async(fileName, packageV) => {
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

    const [ packageName, packageVersion ] = packageV.split('@');

    console.log("File Name: " + chalk.greenBright(fileName));
    console.log("Package Name: " + chalk.greenBright(packageName));
    console.log("Package Version: " + chalk.greenBright(packageVersion));

    return { packageName, packageVersion };
}