<script>
import { onMount } from 'svelte'

export let user = ""
let root;
let chart;

function randomNumber(max) {
    return Math.floor(Math.random() * max)
}
function randomColor() {
    return `rgb(${randomNumber(255)}, ${randomNumber(255)}, ${randomNumber(255)})`
}

async function getRepositories(username, chart) {
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
        const repositories = await res.json()

        if(repositories.length > 0) {
            const languageMap = repositories.reduce((accum, value) => {
                if(!value.language) return accum

                const key = value.language.name
                if(!accum.has(key)) {
                    accum.set(key, [])
                }

                accum.get(key).push(value)
                return accum
            }, new Map())
            const sortedLanguages = new Map([...languageMap].sort((a, b) => a[0] > b[0]))

            chart.data.labels = [...sortedLanguages.keys()]
            let data = []

            for(const list of sortedLanguages.values()) {
                data.push(list.length)
            }

            chart.data.datasets = [{
                data: data,
                backgroundColor: data.map(randomColor)
            }]

            chart.update()
        }
    }
    catch(e) {
        console.error(e)
    }
}

onMount(async () => {

})

$: if(user !== "") getRepositories(user, chart)
</script>
<div>
    <h1>Languages for {user}</h1>
    <div bind:this={root}></div>
</div>