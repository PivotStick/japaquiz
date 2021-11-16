<button {...$$props} on:click>
  <slot />
</button>

<style lang="scss">
  button {
    cursor: pointer;

    padding: 0.5em 1em;
    background-color: rgba(var(--primary), 0.1);
    color: rgb(var(--primary));
    border: 1px solid transparent;
    border-radius: 0.5em;

    transition: 200ms;
    transition-property: transform, border-color, background-color, color;

    &:hover {
      border-color: rgb(var(--primary));
      transform: scale(1.1);
    }

    &:active {
      transform: scale(1);
      background-color: rgb(var(--primary));
      color: white;
    }
  }
</style>
