<script>
import { createEventDispatcher } from "svelte";

    export let winCount = 0;
    export let failCount = 0;

    const dispatch = createEventDispatcher();

    const handleReset = () => dispatch("reset");
</script>

<h1 on:click={handleReset} class="answers --clickable">
    <span class="answers__correct">{winCount}</span>
    - 
    <span class="answers__incorrect">{failCount}</span>
</h1>

<style lang="scss">
	.answers {
		&__correct { color: green }
		&__incorrect { color: red }

        font-weight: 800;
	}
</style>