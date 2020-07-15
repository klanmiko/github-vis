import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'
import { repo } from 'ipfs/src/core/components';

class SwarmDB {
    constructor(ipfs) {
        this.orbitdb = OrbitDB.createInstance(ipfs);
    }

    async init() {
        const orbitdb = await this.orbitdb
        this.db_repos = orbitdb.docs("github-vis:repos")
        this.db_topics = orbitdb.keyvalue("github-vis:topics")
        this.db_languages = orbitdb.keyvalue("github-vis:languages")
    }

    async putRepository(repo) {
        const db_repos = await this.db_repos
        const new_doc = {
            _id: repo._id || repo.id,
            owner: {
                login: repo.owner.login
            },
            language: repo.language,
            languages_url: repo.languages_url,
            tags_url: repo.tags_url,
            updated_at: repo.updated_at
        }

        return await db_repos.put(new_doc)
    }

    async getRepositories(user) {
        const db_repos = await this.db_repos
        return await db_repos.query(repo => repo.owner.login = user)
    }

    async getRepositoryLanguages(repo) {

    }

    async putRepositoryLanguage(repo, language) {

    }

    async getRepositoryTopics(repo) {

    }

    async putRepositoryTopic(repo, topic) {

    }
}

class GitHubAPI {
    static get defaultOptions() {
        return {}
    }

    constructor(options) {
        this.options = {
            ...GitHubAPI.defaultOptions,
            ...options
        }
    }

    async getRepositoryLanguages(repo) {
        try {
            const res = await fetch(repo.languages_url, {
                method: 'GET',
                headers: {
                    Accept: 'application/vnd.github.v3+json'
                }
            })
    
            return await res.json()
        } catch(e) {
            console.error(e)
        }
    }

    async getRepositories(user) {
        try {
            let url = new URL(`https://api.github.com/users/${user}/repos`)
            url.searchParams.append("sort", "updated")
            url.searchParams.append("direction", "desc")
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/vnd.github.v3+json'
                }
            })
    
            return await res.json()
        }
        catch(e) {
            console.error(e)
        }
    }
}

const initIPFSInstance = async () => {
    const ipfs = await IPFS.create();
    const db =  new SwarmDB(ipfs)
    await db.init()
    return db
};

const swarmAPI = initIPFSInstance()

const githubAPI = new GitHubAPI()

export async function getRepositoryLanguages(repo) {
    const languages = await githubAPI.getRepositoryLanguages(repo)
    return languages
}

export async function getRepositories(user) {
    const swarmDB = await swarmAPI
    const putAllRepos = async repositories => {
        for(const repo of repositories) {
            const hash = await swarmDB.putRepository(repo)
            console.log(hash)
            break
        }
    }
    const repos =  await swarmDB.getRepositories(user)
    if(repos.length == 0) {
        const repositories = await githubAPI.getRepositories(user)
        putAllRepos(repositories)
        return repositories
    } else {
        console.log(repos)
        return repos
    }
}

export function getUpdatedAt(repo) {
    return Date.parse(repo.updated_at)
}

export function groupReposByLanguage(repos) {
    const unsortedMap = repos.reduce((accum, value) => {
            if(!value.language) return accum

            const key = value.language
            if(!accum.has(key)) {
                accum.set(key, [])
            }

            accum.get(key).push(value)
            return accum
        }, new Map())
    return new Map([...unsortedMap].sort((a, b) => a[0] > b[0]))
}