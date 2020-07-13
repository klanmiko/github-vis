<script>
import { onMount } from 'svelte'
import bb from "billboard.js"
import { getRepositories, groupReposByLanguage, getUpdatedAt } from './model.js'

export let user = ""
let root;
let chart;
let languageMap;
let dateMin = 0;
let dateMax = 0;
let dateCutoff = dateMin;

function randomNumber(max) {
    return Math.floor(Math.random() * max)
}
function randomColor() {
    return `rgb(${randomNumber(255)}, ${randomNumber(255)}, ${randomNumber(255)})`
}

async function renderFullLanguages(promises) {
    const resolved = await Promise.all(promises)
    const languageMap = resolved.reduce(async (accum, languages) => {
        for(const [language, loc] in languages) {
            if(!accum.has(language)) accum.set(language, 0)
            accum.set(language, accum.get(language) + loc)
        }
    }, new Map())
}

function renderLanguages(languageMap) {
    let columns = []

    for(const [language, repos] of languageMap) {
        columns.push([language, ...repos.map(() => 1)])
    }

    chart.load({
        columns
    })
}

onMount(async () => {
    chart = bb.generate({
        bindto: root,
        data: {
            type: "pie",
            columns: [],
            empty: {
                label: {
                    text: "Select user to load data"
                }
            }
        }
    });
})

$: if(user !== "") getRepositories(user).then(repos => {
    const updatedMap = repos.map(getUpdatedAt).map(Date.parse)
    console.log(updatedMap)
    dateMin = Math.min(...updatedMap)
    dateMax = Math.max(...updatedMap)
    dateCutoff = dateMin
    renderLanguages(groupReposByLanguage(repos))
})
</script>
<div>
    <h1>Languages for {user}</h1>
    <div bind:this={root}></div>
    <input type="range" min={dateMin} max={dateMax} bind:value={dateCutoff}/>
</div>