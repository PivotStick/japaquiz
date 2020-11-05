<script>
import { createEventDispatcher } from "svelte";

    export let winCount = 0;
    export let failCount = 0;

    const dispatch = createEventDispatcher();

    const handleReset = () => dispatch("reset");
</script>

<h1 on:click={handleReset} class="answers">
    <span class="answers__correct">{winCount}</span>
    - 
    <span class="answers__incorrect">{failCount}</span>
</h1>

<style lang="scss">
	.answers {
		&__correct { color: green }
		&__incorrect { color: red }

        cursor: pointer;

        font-weight: 800;
        user-select: none;
        transition: transform 200ms;

        &:hover { transform: scale(1.1) }
        &:active { transform: scale(0.9) }
	}
</style>