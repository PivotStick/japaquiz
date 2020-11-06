<script>
    import { slide, scale } from "svelte/transition";
    import Button from "../components/Button.svelte";
    import History from "../components/History.svelte";
    import NumberAccents from "../components/NumberAccents.svelte";
    import Score from "../components/Score.svelte";
    import { formatNumber, getRandomNumber, getKansuji } from "../services/numbers";

    let userInput = "";
    let showHint = false;
    let winCount = 0;
    let failCount = 0;
    let answers = [];
    let randomNumber = getRandomNumber();

    const handleSubmit = () => {
        const possibleAnswers = Object.values(answer);
        const isCorrect = possibleAnswers.includes(userInput);

        if (isCorrect)
            winCount++;
        else
            failCount++;

        if (answers.length >= 5)
            answers.pop();

        answers = [
            {
                isCorrect,
                userInput,
                answer: randomNumber,
                word: possibleAnswers.join("・"),
            },
            ...answers
        ];

        userInput = "";
        randomNumber = getRandomNumber();
    };

    const handleChange = e => {
        const value = e.target.value; 
        userInput = value.replace(/ /g, "");
    };

    const handleReset = () => {
        winCount = 0;
        failCount = 0;
        answers = [];
    };

    $: answer = getKansuji(randomNumber);
</script>

<main transition:slide>
    <NumberAccents />
    <Score {winCount} {failCount} on:reset={handleReset} />
    {#if showHint}
        <div class="number__hint" transition:scale>
            <h2>Kanji・{answer.kanji}</h2>
            <h2>Kana・{answer.katakana}</h2>
        </div>
    {/if}
    <form on:submit|preventDefault={handleSubmit}>
        <h1 class="number --clickable" on:click={() => showHint = !showHint}>
            {formatNumber(randomNumber)}
        </h1>
        <input type="text" value={userInput} on:input={handleChange}>
        <Button type="submit">Valider</Button>
    </form>
    <History data={answers} />
</main>

<style lang="scss">
    .number {
        font-size: 4em;
        text-align: center;

        margin-bottom: .5em;

        &__hint {
            position: fixed;

            top: 3em;

            background-color: white;
            padding: 1em 2em;
            border-radius: 1em;

            box-shadow: 0 .5em 1em rgba(black, 0.2);
        }
    }

    form {
        display: flex;
        flex-direction: column;

        align-items: stretch;

        border: .5em solid currentColor;
        border-radius: 1em;
        padding: 2em 4em;
        margin: 2em 0;

        input { display: block }
    }
</style>