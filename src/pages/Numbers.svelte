<script>
    import { slide } from "svelte/transition";
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
    };

    $: answer = getKansuji(randomNumber);
</script>

<main transition:slide>
    <NumberAccents />
    <Score {winCount} {failCount} on:reset={handleReset} />
    <h1 class="number --clickable" on:click={() => showHint = !showHint}>
        {formatNumber(randomNumber)}
    </h1>
    {#if showHint}
        <pre transition:slide>{JSON.stringify(answer, null, 2)}</pre>
    {/if}
    <form on:submit|preventDefault={handleSubmit}>
        <input type="text" value={userInput} on:input={handleChange}>
        <button type="submit">Next</button>
    </form>
    <History data={answers} />
</main>

<style lang="scss">
    .number {
        font-size: 4em;
    }
</style>