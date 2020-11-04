<script>
    import kanji from "../kanji";
    import Filters from "./Filters.svelte";
    import MultiQuizz from "./MultiQuizz.svelte";

    let choices = Object.keys(kanji);
    let wanted = [choices[0]];

    const getCharacters = filter => {
        const result = [];
        for (const type in kanji) {
            if (!filter.includes(type)) continue;

            const chars = kanji[type];
            result.push(...chars);
        }
        
        return result;
    };

    let characters = getCharacters(wanted);

    $: characters = getCharacters(wanted);
</script>

<main>
    <Filters bind:group={wanted} {choices} />
    <MultiQuizz
        heading="漢字"
        shouldFilter={false}
        {characters}
    />
</main>