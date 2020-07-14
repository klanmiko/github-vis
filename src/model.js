import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'

// For js-ipfs >= 0.38

// Create IPFS instance
const initIPFSInstance = async () => {
  return await IPFS.create({ repo: "./path-for-js-ipfs-repo" });
};

initIPFSInstance().then(async ipfs => {
  const orbitdb = await OrbitDB.createInstance(ipfs);

  // Create / Open a database
  const db = await orbitdb.log("hello");
  await db.load();

  // Listen for updates from peers
  db.events.on("replicated", address => {
    console.log(db.iterator({ limit: -1 }).collect());
  });

  // Add an entry
  const hash = await db.add("world");
  console.log(hash);

  // Query
  const result = db.iterator({ limit: -1 }).collect();
  console.log(JSON.stringify(result, null, 2));
});

export async function getRepositoryLanguages(repo) {
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

export async function getRepositories(user) {
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
        // renderFullLanguages(repos.map(repo => getRepositoryLanguages(repo))) rate limiting issue

        return await res.json()
    }
    catch(e) {
        console.error(e)
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