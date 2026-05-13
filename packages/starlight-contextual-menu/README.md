# @ekline-io/starlight-contextual-menu

> **Ekline fork of [`starlight-contextual-menu`](https://github.com/corsfix/starlight-contextual-menu)** by Reynaldi Chernando (Corsfix).
> Differences from upstream are listed under [What's different in this fork](#whats-different-in-this-fork).

Adds a per-page contextual menu (Copy / View as Markdown / Open in Claude / Open in ChatGPT / …) next to the H1 on every Starlight docs page.

## Usage

```bash
npm i @ekline-io/starlight-contextual-menu
```

In your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightContextualMenu from "@ekline-io/starlight-contextual-menu";

export default defineConfig({
  integrations: [
    starlight({
      title: "My Docs",
      plugins: [
        starlightContextualMenu({
          actions: ["copy", "view", "claude", "chatgpt"],
        }),
      ],
      sidebar: [
        // …
      ],
    }),
  ],
});
```

### Built-in actions

| Key | What it does |
|---|---|
| `copy` | Fetch `<url>.md` and write it to the clipboard |
| `view` | Open `<url>.md` in a new tab |
| `chatgpt` | Open ChatGPT with a "read this page" prompt |
| `claude` | Open Claude with a "read this page" prompt |
| `lechat` | Open Mistral Le Chat with the same prompt |
| `grok` | Open Grok with the same prompt |

### Options

| Option | Default | Notes |
|---|---|---|
| `actions` | `["copy", "view"]` | Order in the array = order in the dropdown. First entry is also the primary button. |
| `injectMarkdownRoutes` | `true` | Set to `false` if another integration already serves `/<slug>.md` routes. |
| `hideMainActionLabel` | `false` | Hide the text on the primary button (icon-only). |

## What's different in this fork

1. **Inlines `starlight-markdown`.** Upstream pulls in [`starlight-markdown`](https://github.com/reynaldichernando/starlight-markdown) as a peer dependency to register the markdown routes. We've inlined that logic (~25 LoC) so the install is self-contained — no second peer dep to track.

2. **URL pattern is `/<slug>.md`** (not `/<slug>/index.md`). Aligns with the convention used by Anthropic, Vercel, and Next.js docs, where every HTML page has a sibling at the same URL with `.md` appended.

3. **View-transitions safe.** Upstream only attaches the menu on `DOMContentLoaded`, which doesn't re-fire during Starlight's SPA-style navigation, so the menu disappears after the first navigation until you refresh. This fork also listens on `astro:page-load` and re-attaches idempotently on every page render.

4. **Astro 6 supported.** Peer dep is `astro@^5 || ^6` (upstream is `^5` only).

## Credit

Original plugin and ongoing upstream maintenance by [Reynaldi Chernando / Corsfix](https://github.com/corsfix/starlight-contextual-menu) under MIT. The inlined `markdown-route.js` is adapted from `starlight-markdown@0.1.5` by the same author. Both retain their MIT copyright.

## License

[MIT](LICENSE)
