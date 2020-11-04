<script>
import History from "./History.svelte";
import Quizz from "./Quizz.svelte";

import Score from "./Score.svelte";


    export let characters = [];
    export let shouldFilter = true;
    export let heading = undefined;

    let failCount = 0;
    let winCount = 0;
    let answers = [];

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
        current = getRandomCharacter();
    };

    let current = getRandomCharacter();
</script>

<Score {winCount} {failCount} />
<Quizz
    kana={current.character}
    correctAnswer={current.answer}
    on:answer={handleAnswer}

    {heading}
    {shouldFilter}
/>
<History data={answers} />