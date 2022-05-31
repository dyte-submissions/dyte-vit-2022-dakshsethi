import 'dotenv/config'
import fetch from "node-fetch";

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

export const githubRepoData = async(repos, packageName, packageVersion) => {
    // just to check if the user is able to login
    const { data: { login } } = await octokit.rest.users.getAuthenticated();
    console.log("Hello %s", login);

    console.log(repos);
    repos.forEach(repo => {
        const repoURL = repo.repo;
        let repoName = repoURL.split('/');
        repoName = repoName[repoName.length - 1];
        if (repoName === "") {
            repoName = repoURL.split('/');
            repoName = repoName[repoName.length - 2];
        }
        console.log(repoURL + " => " + repoName);

        let status = getPackageFile(repoName, packageName, packageVersion);
        status.then((result) => {
            repo.version = result.actualVersion
            repo.version_satisfied = result.status;
            console.log(repo)
        })
    });
}