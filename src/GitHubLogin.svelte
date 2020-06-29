<script>
import { onMount, setContext } from 'svelte'
export let token = undefined

let url = new URL(window.location)

if(url.searchParams.has("access_token")) {
    if(!token) token = url.searchParams.get("access_token")
    url.searchParams.delete("access_token")
    window.history.replaceState({}, document.title, url.toString())
}

if(token) {
    sessionStorage.clear('github_token')
    sessionStorage.setItem('github_token', token)
} else {
    token = sessionStorage.getItem('github_token')
}

url.searchParams.append("access_token", `Basic ${window.btoa("")}`)

setContext('token', token)
</script>
<div>
    {#if !token}
        <a href={url.toString()}>Authorize GitHub</a>
    {/if}
    <slot></slot>
</div>