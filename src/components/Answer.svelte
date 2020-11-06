<script>
    import { slide } from "svelte/transition";
    import SlideText from "./SlideText.svelte";

    export let answer;
    export let animate = true;
    export let hover = true;
</script>

{#if answer}
    <SlideText {hover} shouldSlide={animate}>
        {#if answer.isCorrect}
        {answer.word} ✔
        {:else}
        <span>『{answer.answer}』</span>{answer.word} ≠ {answer.userInput} ❌
        {/if}
        {#if answer.meaning}『{answer.meaning}』{/if}
    </SlideText>
{:else}
    <h1 out:slide>Your previous answers are displayed here.</h1>
{/if}

<style lang="scss">
    h1 { text-align: center }
    span { color: green }
</style>