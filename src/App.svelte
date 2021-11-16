<script>
  import Kana from "./pages/Kana.svelte";
  import Vocabulary from "./pages/Vocabulary.svelte";
  import Numbers from "./pages/Numbers.svelte";

  import Nav from "./components/Nav.svelte";
  import Links from "./components/Links.svelte";

  let type = "kana";

  const pages = {
    kana: { page: Kana, name: "Les Kana" },
    vocabulary: { page: Vocabulary, name: "Le Vocabulaire" },
    numbers: { page: Numbers, name: "Les Nombres" },
  };

  const handleChange = ({ detail }) => {
    type = detail.link;
  };

  $: page = pages[type].page;

  $: links = Object.keys(pages).map((link) => {
    const name = pages[link].name;
    return { link, name };
  });
</script>

<Nav {links} currentLink={type} on:change={handleChange} />
{#if page}
  <svelte:component this={page} />
{/if}
<Links />

<style lang="scss" global>
  @import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");

  html,
  body {
    position: relative;
    width: 100%;
    height: 100%;
  }

  *,
  *::after,
  *::before {
    margin: 0;
    padding: 0;

    box-sizing: border-box;
    transition: none 600ms cubic-bezier(0, 0.5, 0, 1);
  }

  *::selection {
    background-color: rgb(var(--primary));
    color: white;
  }

  :root {
    --primary: 255, 62, 0;

    color: rgb(var(--primary));
    font-family: "Nunito", sans-serif;
  }

  ul,
  ol {
    list-style: none;
  }

  a {
    color: rgb(0, 100, 200);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
    &:visited {
      color: rgb(0, 80, 160);
    }
  }

  label {
    display: block;
  }

  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
    padding: 0.4em;
    margin: 0 0 0.5em 0;
    box-sizing: border-box;
    border: 1px solid currentColor;
    border-radius: 2px;

    outline: 0px solid rgba(var(--primary), 0.25);

    transition: outline-width linear 75ms;

    &:focus {
      outline-width: 3px;
    }
  }

  input:disabled {
    color: #ccc;
  }

  button {
    font: inherit;
    color: white;
    background-color: rgb(var(--primary));
    border: none;
    border-radius: 0.25em;

    transition-property: transform, background-color;

    &:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    &:active {
      background-color: rgba(var(--primary), 0.25);
    }
  }

  main {
    position: absolute;

    background-color: white;

    top: 0;
    left: 0;
    right: 0;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    box-sizing: border-box;
    padding: 3em 0;
  }

  .--clickable {
    cursor: pointer;
    user-select: none;

    transition-property: transform;

    &:hover {
      transform: scale(1.1);
    }
    &:active {
      transform: scale(1);
    }
  }
</style>
