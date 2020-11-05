<script>
    import { slide } from "svelte/transition";
    import kana from "../kana";
    import Filters from "../components/Filters.svelte";
    import MultiQuizz from "../components/MultiQuizz.svelte";

    let characters = [];

    const handleChange = ({ detail: filter }) => {
        if (!filter) return;

        const result = [];
        for (const type in kana) {
            if (!filter.includes(type)) continue;

            const chars = kana[type];
            result.push(...chars);
        }
        
        characters = result;
    };

    const firstKana = Object.keys(kana)[0];
    characters = kana[firstKana];
</script>

<main transition:slide>
    <Filters choicesObject={kana} on:change={handleChange} />
	<MultiQuizz
		heading="かな"
        shouldFilter={false}
        {characters}
    />
</main>