<script>
	import History from "./History.svelte";
	import Quizz from "./Quizz.svelte";
	import { getRandomKana } from "../data";

	let kana = getRandomKana();
	let answers = [];

	let correctAnswerCount = 0;
	let incorrectAnswerCount = 0;

	const handleAnswer = ({ detail }) => {
		kana = getRandomKana();
		answers = [detail, ...answers];

		if (answers.length > 10)
			answers = answers.filter((_, i) => i !== 0);

		if (detail.isCorrect)
			correctAnswerCount++;
		else
			incorrectAnswerCount++;
	};
</script>

<main>
	<h1 class="answers">
		<span class="answers__correct">{correctAnswerCount}</span>
		 - 
		<span class="answers__incorrect">{incorrectAnswerCount}</span>
	</h1>
	<Quizz
		kana={kana.hiragana}
		correctAnswer={kana.romanji}
		on:answer={handleAnswer}
	/>
	<History
		data={answers}
	/>
</main>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;

		align-items: center;
		justify-content: center;

		height: 100vh;
	}

	.answers {
		&__correct { color: green }
		&__incorrect { color: red }
	}
</style>