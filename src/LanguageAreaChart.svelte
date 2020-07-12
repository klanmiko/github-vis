<script>
import { onMount, getContext } from 'svelte'
import gql from 'nanographql-esm'

var repoQuery = gql`
query($name: String!) {
    user (login: $name) {
        repositories(first: 100, orderBy: {field: UPDATED_AT, direction: ASC}) {
            nodes {
                primaryLanguage {
                    name
                }
                name
                updatedAt
                isFork
                owner {
                    login
                }
            }
        }
    }
}
`

export let user = ""
let canvas;
let chart;
const token = getContext('token')

function randomNumber(max) {
    return Math.floor(Math.random() * max)
}
function randomColor() {
    return `rgb(${randomNumber(255)}, ${randomNumber(255)}, ${randomNumber(255)})`
}

async function getRepositories(username, token, chart) {
    try {
        let res = await fetch('https://api.github.com/graphql', {
            body: repoQuery({name: username}),
            method: 'POST',
        })
        res = await res.json()
        let repositories = res.data.user.repositories.nodes

        if(repositories.length > 0) {
            const languageMap = repositories.reduce((accum, value) => {
                if(!value.primaryLanguage) return accum

                const key = value.primaryLanguage.name
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
    chart = new Chart(canvas.getContext('2d'), {
            type: 'polarArea',
            options: {
                scales: {
                    responsive: true,
                }
            }
        })
})

$: if(token && user !== "") getRepositories(user, token, chart)
</script>
<div>
    <h1>Languages for {user}</h1>
    <canvas bind:this={canvas}></canvas>
</div>