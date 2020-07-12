<script>
	import SocialGraph from './SocialGraph.svelte'
	import LanguageAreaChart from './LanguageAreaChart.svelte'
	import UserSelect from './UserSelect.svelte'

	let user = ""
</script>

<main>
	<UserSelect callback={u => user = u}/>
	<LanguageAreaChart user={user}/>
	<SocialGraph user={user}/>
</main>

<style>
</style>