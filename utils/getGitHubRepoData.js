import 'dotenv/config'
import fetch from "node-fetch";
import { table } from 'table';
import chalk from 'chalk';
import fs from 'fs';
import { stringify } from 'csv-stringify';

import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

async function checkDependecy(data, packageName, packageVersion) {
    let actualVersion = "";
    if(data.devDependencies) {
        actualVersion = data.devDependencies[packageName];
    } else {
        actualVersion = data.dependencies[packageName];
    }
    
    /*
    Any package version is of the form x.x.x with 3 important components:
        -- Patch releases: 1.0 or 1.0.x or ~1.0.4
        -- Minor releases: 1 or 1.x or ^1.0.4
        -- Major releases: * or x

    Here we'll be removing the ^ or ~ from the starting of the version & further check
    */
    if(actualVersion[0] === '^' || actualVersion[0] === '~') actualVersion = actualVersion.slice(1);
    const [ major, minor, patch ] = actualVersion.split('.');
    const [ majorC, minorC, patchC ] = packageVersion.split('.');

    if(major >= majorC)
        if(minor >= minorC)
            if(patch >= patchC)
                return { status: true, actualVersion }
    return { status: false, actualVersion }
}

async function getPackageFile(repoName, packageName, packageVersion) {
    try {
        const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${repoName}/main/package.json`
        let options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
            }
        }

        let fetchRes = fetch(url, options);
        let data = await fetchRes.then(res =>
            res.json()).then(jsonData => {
                return jsonData;
            }
        )

        const flag = checkDependecy(data, packageName, packageVersion);
        return flag;

    } catch(error) {
        console.error(error);
    }
}

const generateCLITable = (repos) => {
    let data = [];
    for(const repo of repos) {
        let d = [];
        d.push(repo.name, repo.repo, repo.version, repo.version_satisfied ? chalk.greenBright(repo.version_satisfied) : chalk.redBright(repo.version_satisfied));
        data.push(d);
    }
  
    const config = {
        columnDefault: {
        width: 10,
        },
        header: {
            alignment: 'center',
            content: 'OUTPUT',
        },
    }
  
    console.log(table(data, config));
}

const generateCSV = (repos) => {
    const filename = "output.csv";
    const writableStream = fs.createWriteStream(filename);

    const columns = [
        "name",
        "repo",
        "version",
        "version_satisfied"
    ];

    const stringifier = stringify({ header: true, columns: columns });
    for(const repo of repos) {
        let row = [];
        row.push(repo.name, repo.repo, repo.version, repo.version_satisfied ? "true": "false");
        stringifier.write(row);
    }

    stringifier.pipe(writableStream);
    console.log(`Finished writing data into ${filename}`);
}

export const githubRepoData = async(repos, packageName, packageVersion) => {
    // just to check if the user is able to login
    try {
    const { data: { login } } = await octokit.rest.users.getAuthenticated();
    console.log("Hello %s", login);
    } catch(error) {
        console.log(chalk.bgRed("Error in Logging you in!! Check your Personal Access Token"))
        return ;
    }

    // checking each repo by iteration
    for(const repo of repos) {
        const repoURL = repo.repo;
        let repoName = repoURL.split('/');
        repoName = repoName[repoName.length - 1];
        if (repoName === "") {
            repoName = repoURL.split('/');
            repoName = repoName[repoName.length - 2];
        }

        let result = await getPackageFile(repoName, packageName, packageVersion);
        repo.version = result.actualVersion;
        repo.version_satisfied = result.status;
    }

    generateCLITable(await repos);
    generateCSV(await repos);
}