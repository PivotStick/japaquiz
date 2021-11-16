<script>
  const links = [
    {
      text: "Julien Fontanier",
      emoji: "😎",
      href: "https://www.youtube.com/watch?v=Hs8oR3xDokA&list=PLC8UWZPWDAiW-v0OtWMAHdnqDwx7kQ8K-&index=1&t=0",
    },
    {
      text: "Comment écrire avec un clavier Japonais ?",
      emoji: "🤔",
      href: "https://www.youtube.com/watch?v=s0Jv-Z9QE0E&t=0s",
    },
  ];
</script>

<div class="links">
  {#each links as { text, href, emoji }}
    <a class="links__link" target="_blank" {href}>
      {text}
      {emoji}
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

    &__link {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 0.65em;

      text-decoration: none;
      padding: 0.5em 1.5em 0.65em;
      padding-right: 0.5em;
      border-radius: 2em;

      transform-origin: right bottom;
      border: 1px solid rgb(var(--primary));
      color: rgb(var(--primary));
      background-color: white;
      font-weight: 800;

      transition-duration: 200ms;
      transition-property: color, background-color;

      &:hover {
        color: white;
        background-color: rgb(var(--primary));
      }
      &:not(:last-child) {
        margin-bottom: 0.5em;
      }
    }
  }
</style>
