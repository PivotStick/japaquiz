<script>
  import { slide } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";

  export let currentLink;
  export let links = [];

  const dispatch = createEventDispatcher();

  const handleClick = (link) => () => {
    isVisible = false;
    dispatch("change", { link });
  };

  let isVisible = false;
</script>

<nav class="nav">
  <Button on:click={() => (isVisible = !isVisible)}>
    {isVisible ? "Fermer" : "Menu"}
  </Button>
  {#if isVisible}
    <ul transition:slide class="nav__links">
      {#each links as { name, link }}
        <li
          class="nav__link"
          class:current={link === currentLink}
          on:click={handleClick(link)}
        >
          {name}
        </li>
      {/each}
    </ul>
  {/if}
</nav>

<style lang="scss">
  .nav {
    position: fixed;

    z-index: 25;

    top: 1em;
    right: 1em;

    &__links {
      position: absolute;
      top: 3em;
      right: 0;
      width: max-content;

      background-color: white;
      box-shadow: 0 0.25em 1em rgba(var(--primary), 0.25);
      padding: 1em;
      border-radius: 1em;
    }

    &__link {
      cursor: pointer;

      padding: 0.25em 1em;
      background-color: rgba(var(--primary), 0.25);

      border: 1px solid transparent;
      border-radius: 0.5em;

      transform-origin: center right;

      transition-duration: 200ms;
      transition-property: border-color, background-color, transform;

      &:hover {
        border-color: currentColor;
        background-color: transparent;
        transform: scale(1.05);
      }

      &:active {
        transform: scale(1);
      }

      &:not(:last-child) {
        margin-bottom: 0.5em;
      }

      &.current {
        pointer-events: none;
        background-color: rgb(var(--primary));
        color: white;
      }
    }
  }
</style>
