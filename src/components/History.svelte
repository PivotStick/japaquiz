<script>
  import { slide } from "svelte/transition";
  import Answer from "./Answer.svelte";

  export let data;

  let hidden = true;

  $: [lastAnswer, ...rest] = data;
</script>

<Answer hover={false} answer={lastAnswer} />
{#if data.length > 1}
  <button
    class="--clickable"
    transition:slide
    on:click={() => (hidden = !hidden)}
  >
    {hidden ? "詳細「しょうさい」" : "隠す「かくす」"}
  </button>
{/if}
{#if !hidden}
  <div>
    {#each rest as answer}
      <Answer {answer} />
    {/each}
  </div>
{/if}

<style lang="scss">
  button {
    cursor: pointer;

    color: rgb(var(--primary));
    border: 1px solid currentColor;

    background: none;
    padding: 0.5em 2em;

    margin-top: 2em;
  }
</style>
