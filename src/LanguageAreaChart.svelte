<script>
import { onMount } from 'svelte'
import bb from "billboard.js"
import { getRepositories, groupReposByLanguage, getUpdatedAt } from './model.js'

export let user = ""
let root;
let chart;
let languageMap = new Map();
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
        columns: columns.filter(set => set.length > 1),
        unload: true
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

async function loadRepositories(user) {
    const repos = await getRepositories(user)
    const updatedMap = repos.map(getUpdatedAt)
    dateMin = Math.min(...updatedMap)
    dateMax = Math.max(...updatedMap)
    dateCutoff = dateMin
    languageMap = groupReposByLanguage(repos)
    renderLanguages(languageMap)
}

function updateDate() {
    console.log("change")
    let cutoffMap = new Map()
    for(const [language, repos] of languageMap) {
        cutoffMap.set(language, repos.map(getUpdatedAt).filter(time => time > dateCutoff))
    }
    renderLanguages(cutoffMap)
}

$: if(user !== "") loadRepositories(user)

</script>
<div>
    <h1>Languages for {user}</h1>
    <div bind:this={root}></div>
    <input type="range" min={dateMin} max={dateMax} bind:value={dateCutoff} on:change={updateDate}/>
</div>