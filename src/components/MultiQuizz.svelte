<script>
import Button from "./Button.svelte";
import History from "./History.svelte";
import Quizz from "./Quizz.svelte";

import Score from "./Score.svelte";


    export let characters = [];
    export let shouldFilter = true;
    export let heading = undefined;

    let failCount = 0;
    let winCount = 0;
    let answers = [];
    let isRandom = true;
    let currentIndex = 0;

    const getRandomCharacter = () => {
        const randomNumber = Math.random() * (characters.length - 1);
        const randomIndex = Math.round(randomNumber);

        return characters[randomIndex];
    };

    const handleAnswer = ({ detail }) => {
        const { isCorrect } = detail;

        if (isCorrect)
            winCount++;
        else
            failCount++;
        
        if (answers.length > 9)
            answers.pop();

        answers = [detail, ...answers];

        if (!isRandom) {
            const lastIndex = characters.length - 1;
            if (++currentIndex > lastIndex)
                currentIndex = 0;
            
            current = characters[currentIndex];
        } else
            current = getRandomCharacter();
    };

    const handleReset = () => {
        winCount = 0;
        failCount = 0;
        answers = [];
    };

    const handleMode = () => {
        isRandom = !isRandom;

        if (!isRandom) {
            currentIndex = 0;
            current = characters[currentIndex];
        } else {
            current = getRandomCharacter();
        }
    };

    let current = getRandomCharacter();
</script>

<div class="btn">
    <Button on:click={handleMode}>
        mode "{isRandom ? "Random" : "In Order"}"
    </Button>
</div>
<Score {winCount} {failCount} on:reset={handleReset}/>
<Quizz
    on:answer={handleAnswer}

    {...current}
    {heading}
    {shouldFilter}
/>
<History data={answers} />

<style lang="scss">
    .btn {
        position: fixed;

        bottom: 1em;
        left: 1em;
    }
</style>