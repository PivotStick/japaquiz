<script>
    import { createEventDispatcher } from "svelte";
    import { scale } from "svelte/transition";

    const dispatch = createEventDispatcher();

    export let heading = "ひらがな";
    export let shouldFilter = true;
    export let kana;
    export let correctAnswer;

    let userInput = "";
    let showHint = false;
    let input = null;

    const handleSubmit = () => {
        if (!userInput) return;

        const result = { userInput, kana, correctAnswer };

        if (correctAnswer instanceof Array)
            result.isCorrect = correctAnswer.includes(userInput);
        else
            result.isCorrect = userInput === correctAnswer;

        dispatch("answer", result);
        userInput = "";
        showHint = false;
    };

    const handleChange = e => {
        userInput = e.target.value.trim();

        if (shouldFilter)
            userInput = userInput.replace(/[^A-Za-z]/g, "");
    };

    const handleShowHint = () => showHint = !showHint;

    $: {
        if (input && showHint === false)
            input.focus();
    }
</script>
{#if showHint}
<div transition:scale class="quizz__hint">
    {#if correctAnswer instanceof Array}
    <ul>
        {#each correctAnswer as answer}
            <li><h1>• {answer}</h1></li>
        {/each}
    </ul>
    {:else}
    <h1>{correctAnswer}</h1>
    {/if}
</div>
{/if}
<h1 class="quizz__heading">{heading}</h1>
<article class="quizz">
    <h2 class="quizz__kana" on:click={handleShowHint}>{kana}</h2>
    <form class="quizz__form" on:submit|preventDefault={handleSubmit}>
        <input bind:this={input} class="quizz__input" type="text" value={userInput} on:input={handleChange}>
        <button class="quizz__button" type="submit">次「つぎ」</button>
    </form>
</article>

<style lang="scss">
    .quizz {
        display: flex;
        flex-direction: column;

        align-items: center;

        border: .5em solid currentColor;
        border-radius: 1em;

        margin: 2em 0;
        padding: 2em 15vw;

        &__hint {
            position: fixed;

            top: 2em;
            left: 50%;
            transform: translateX(-50%);

            background-color: white;
            padding: 1em 2em;
            border-radius: .5em;
            box-shadow: 0 .5em 1em rgba(black, 0.15);
        }

        &__heading {
            font-size: 3em;
            text-align: center;
        }

        &__kana {
            cursor: pointer;

            font-size: 8em;
            user-select: none;
            transition: transform 200ms;

            &:hover { transform: scale(1.1) }
            &:active { transform: scale(0.9) }
        }

        &__form {
            display: flex;
            flex-direction: column;

            align-items: center;
        }

        &__button {
            border: none;
            background-color: #ff3e00;
            color: white;

            width: 100%;
            padding: .5em;
        }
    }
</style>