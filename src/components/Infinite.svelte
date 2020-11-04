<script>
    import { slide } from "svelte/transition";
    import kana from "../kana";
    import Filters from "./Filters.svelte";
    import MultiQuizz from "./MultiQuizz.svelte";

    let choices = Object.keys(kana);
    let wanted = [choices[0]];

    const getCharacters = filter => {
        const result = [];
        for (const type in kana) {
            if (!filter.includes(type)) continue;

            const chars = kana[type];
            result.push(...chars);
        }
        
        return result;
    };

    let characters = getCharacters(wanted);

    $: characters = getCharacters(wanted);
</script>

<main transition:slide>
    <Filters bind:group={wanted} {choices} />
	<MultiQuizz
		heading="かな"
        shouldFilter={false}
        {characters}
    />
</main>