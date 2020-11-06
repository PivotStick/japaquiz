<button {...$$props} on:click>
    <slot />
</button>

<style lang="scss">
    button {
        cursor: pointer;

        padding: .5em 1em;
        background-color: rgba(orange, .25);
        color: #ff3e00;
        border: .15em solid transparent;
        border-radius: .5em;

        transition: 200ms;
        transition-property: transform border-color background-color color;

        &:hover {
            background-color: transparent;
            border-color: #ff3e00;
            transform: scale(1.1);
        }

        &:active {
            transform: scale(1);
            background-color: #ff3e00;
            color: white;
        }
    }
</style>