<script>
    const links = [
        {
            text: "Julien Fontanier",
            emoji: "😎",
            href: "https://www.youtube.com/watch?v=Hs8oR3xDokA&list=PLC8UWZPWDAiW-v0OtWMAHdnqDwx7kQ8K-&index=1&t=0"
        },
        { 
            text: "Comment écrire avec un clavier Japonais ?",
            emoji: "🤔",
            href: "https://www.youtube.com/watch?v=s0Jv-Z9QE0E&t=0s"
        },
    ];
</script>

<div class="links">
    {#each links as { text, href, emoji }}
    <a class="links__link" target="_blank" {href}>
        <span>{text}</span>
        <span class="links__emoji">{emoji}</span>
    </a>
    {/each}
</div>

<style lang="scss">
    .links {
        position: fixed;

        bottom: 1em;
        right: 1em;

        display: flex;
        flex-direction: column;
        align-items: flex-end;

        // font-size: .75em;

        &__emoji {
            margin-left: .65em;
        }

        &__link {
            box-sizing: border-box;
            display: block;

            text-decoration: none;
            padding: .4em 2em;
            padding-right: .5em;
            border-radius: 2em;

            transform-origin: right bottom;
            border: .2em solid #ff3e00;
            color: #ff3e00;
            background-color: white;
            font-weight: 800;

            transition-duration: 200ms;
            transition-property: color background-color;

            &:hover {
                color: white;
                background-color: #ff3e00;
            }
            &:not(:last-child) { margin-bottom: .5em }
        }
    }
</style>