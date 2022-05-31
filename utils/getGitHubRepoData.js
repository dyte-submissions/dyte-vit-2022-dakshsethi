import 'dotenv/config'
import fetch from "node-fetch";

import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

async function getPackageFile(repoName) {
    try {
        const url = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${repoName}/main/package.json`
        console.log(url)
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
        console.log(data);
    } catch(error) {
        console.error(error);
    }
  }

export const githubRepoData = async(repos) => {
    // just to check if the user is able to login
    const { data: { login } } = await octokit.rest.users.getAuthenticated();
    console.log("Hello %s", login);

    // console.log(repos);
    repos.forEach(repo => {
        const repoURL = repo.repo;
        let repoName = repoURL.split('/');
        repoName = repoName[repoName.length - 1];
        if (repoName === "") {
            repoName = repoURL.split('/');
            repoName = repoName[repoName.length - 2];
        }
        console.log(repoURL, repoName);

        getPackageFile(repoName);
    });
}