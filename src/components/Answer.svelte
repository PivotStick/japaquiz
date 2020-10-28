<script>
    import { slide } from "svelte/transition";
    import SlideText from "./SlideText.svelte";

    export let answer;
    export let animate = true;
</script>

{#if answer}
    {#if answer.isCorrect}
    <SlideText shouldSlide={animate}>{answer.kana} ✔</SlideText>
    {:else}
    <SlideText shouldSlide={animate}>{answer.kana} ≠ {answer.userInput} ❌ ({answer.correctAnswer})</SlideText>
    {/if}
{:else}
    <h1 out:slide>Your previous answers are displayed here.</h1>
{/if}

<style lang="scss">
    h1 {
        text-align: center;
    }
</style>