<script>

let user = ""
export let callback = user => null

</script>
<div>
    <input bind:value={user} type="text"/>
    <button on:click={() => callback(user)}>Load</button>
</div>