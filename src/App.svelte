<script>
	import SocialGraph from './SocialGraph.svelte'
	import LanguageAreaChart from './LanguageAreaChart.svelte'
	import UserSelect from './UserSelect.svelte'
	import GitHubLogin from './GitHubLogin.svelte'

	let user = ""
</script>

<main>
	<GitHubLogin>
		<UserSelect callback={u => user = u}/>
		<LanguageAreaChart user={user}/>
		<SocialGraph user={user}/>
	</GitHubLogin>
</main>

<style>
</style>