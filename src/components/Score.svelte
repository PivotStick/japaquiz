<script>
    export let winCount = 0;
    export let failCount = 0;
</script>

<h1 class="answers">
    <span class="answers__correct">{winCount}</span>
    - 
    <span class="answers__incorrect">{failCount}</span>
</h1>

<style lang="scss">
	.answers {
		&__correct { color: green }
		&__incorrect { color: red }
	}
</style>