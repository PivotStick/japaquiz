<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let kana;
    export let correctAnswer;

    let userInput = "";

    const handleSubmit = () => {
        if (!userInput) return;

        const result = { userInput, kana, correctAnswer };

        result.isCorrect = userInput === correctAnswer;

        dispatch("answer", result);
        userInput = "";
    };

    const handleChange = e => {
        userInput = e.target.value.trim();
        userInput = userInput.replace(/[^A-Za-z]/g, "");
    };
</script>

<h1 class="quizz__heading">ひらがな</h1>
<article class="quizz">
    <h2 class="quizz__kana">{kana}</h2>
    <form class="quizz__form" on:submit|preventDefault={handleSubmit}>
        <input class="quizz__input" type="text" value={userInput} on:input={handleChange}>
        <button class="quizz__button" type="submit">次「つぎ」</button>
    </form>
</article>

<style lang="scss">
    .quizz {
        display: flex;
        flex-direction: column;

        align-items: center;

        border: .25em solid currentColor;
        border-radius: 1em;

        margin: 2em 0;
        padding: 2em 15vw;

        &__heading {
            font-size: 3em;
        }

        &__kana {
            font-size: 8em;
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