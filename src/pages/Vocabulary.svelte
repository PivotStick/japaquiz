<script>
    import { slide } from "svelte/transition";
    import vocabulary from "../vocabulary";
    import Filters from "../components/Filters.svelte";
    import MultiQuizz from "../components/MultiQuizz.svelte";

    let characters = [];

    const handleChange = ({ detail: filter }) => {
        if (!filter) return;

        const result = [];
        for (const type in vocabulary) {
            if (!filter.includes(type)) continue;

            const words = vocabulary[type].list;
            result.push(...words);
        }
        
        characters = result;
    };

    const firstWords = Object.keys(vocabulary)[0];
    $: characters = vocabulary[firstWords].list;
</script>

<main transition:slide>
    <Filters choicesObject={vocabulary} on:change={handleChange} />
    <MultiQuizz
        heading="漢字"
        shouldFilter={false}
        {characters}
    />
</main>