<script>
    import { slide } from "svelte/transition";
    import { exceptions, getKansuji } from "../services/numbers";
    import Button from "./Button.svelte";

    let showAccents = false;

    const numbers = Object.keys(exceptions);
    const regex = /[ビピッゼ]+/g;
    const replaceFunction = m => `<span class="accents__highlight">${m}</span>`;
</script>

<div class="accents__button">
    <Button on:click={() => showAccents = !showAccents}>
        {showAccents ? "Cacher" : "Montrer"} les accents
    </Button>
</div>
{#if showAccents}
<ul class="accents" transition:slide>
    <a class="accents__link --clickable" href="https://youtu.be/FZEA66Nj95c?t=522" target="_blank">
        Qu’est-ce que c’est ? 🤔
    </a>
    {#each numbers as number}
    <li class={`n${number}`}>
        <b class="accents__number">{number}</b>
        <span class="accents__kanji">{getKansuji(number).kanji}</span>
        <span class="accents__katakana">
            {@html getKansuji(number).katakana.replace(regex, replaceFunction)}
        </span>
    </li>
    {/each}
</ul>
{/if}

<style lang="scss">
    .accents {
        position: fixed;
        z-index: 25;

        bottom: 1em;
        left: 1em;

        padding: 1em 2em;
        border-radius: 1em;

        box-shadow: 0 .5em 1em rgba(black, 0.25);
        background-color: white;
        color: #333;

        display: grid;
        gap: .5em 4em;
        grid-template-areas:
            ".     .    "
            "n300  n3000"
            "n600  .    "
            "n800  n8000";
        
        li { font-size: 2em }

        &__number { margin-right: .25em }
        &__kanji { margin-right: .5em }

        &__katakana { color: rgb(48, 48, 190) }

        :global(&__highlight) { color: #ff3e00 }

        &__link {
            transform-origin: left center;
            font-size: 1.5em;
            margin-bottom: .5em;
        }

        &__button {
            position: fixed;

            top: 1em;
            left: 1em;
        }
    }

    .n300 { grid-area: n300 }
    .n600 { grid-area: n600 }
    .n800 { grid-area: n800 }
    .n3000 { grid-area: n3000 }
    .n8000 { grid-area: n8000 }
</style>