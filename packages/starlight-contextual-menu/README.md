# @ekline/starlight-contextual-menu

> **Ekline fork of [`starlight-contextual-menu`](https://github.com/corsfix/starlight-contextual-menu)** by Reynaldi Chernando (Corsfix).
> Differences from upstream are listed under [What's different in this fork](#whats-different-in-this-fork).

Adds a per-page contextual menu (Copy / View as Markdown / Open in Claude / Open in ChatGPT / …) next to the H1 on every Starlight docs page, plus a parallel `/<slug>.md` URL for every doc and a `<link rel="alternate" type="text/markdown">` component for AI/crawler discoverability.

## Install

```bash
npm i @ekline/starlight-contextual-menu
```

## Set up the menu

In your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightContextualMenu from "@ekline/starlight-contextual-menu";

export default defineConfig({
  integrations: [
    starlight({
      title: "My Docs",
      plugins: [
        starlightContextualMenu({
          actions: ["copy", "view", "claude", "chatgpt"],
        }),
      ],
    }),
  ],
});
```

That alone gives you the per-page menu *and* the `/<slug>.md` routes for every Markdown/MDX entry in `src/content/docs/`.

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

## Set up the alternate-markdown `<link>` tag

The plugin ships a small Astro component, `MarkdownAlternate.astro`, that emits a `<link rel="alternate" type="text/markdown" href="…">` for the current page's Markdown twin. AI crawlers (GPTBot, ClaudeBot, …) use the `rel="alternate"` convention to discover non-HTML representations without having to guess URL shapes.

Add a Starlight `Head` override (`src/components/Head.astro` or similar):

```astro
---
import Default from "@astrojs/starlight/components/Head.astro";
import MarkdownAlternate from "@ekline/starlight-contextual-menu/MarkdownAlternate.astro";
---

<Default />
<MarkdownAlternate />
```

Then point Starlight at it in `astro.config.mjs`:

```js
starlight({
  // …
  components: {
    Head: "./src/components/Head.astro",
  },
}),
```

The component is **safe to render on every page**. It only emits the `<link>` when the current page actually has a Markdown twin (real `.md`/`.mdx` source under `src/content/docs/`). Virtual entries injected by other plugins (`starlight-openapi`'s `/api/**` pages, for instance) are filtered out automatically, so you won't ship `<link>`s that 404.

## Set up content negotiation (Vercel-deployed sites)

For `curl -H "Accept: text/markdown" https://your-site/concepts/glossary/` to return Markdown from the canonical HTML URL, add this to `vercel.json` at the repository root:

```json
{
  "rewrites": [
    {
      "source": "/",
      "has": [
        { "type": "header", "key": "accept", "value": "text/markdown" }
      ],
      "destination": "/index.md"
    },
    {
      "source": "/:path+/",
      "has": [
        { "type": "header", "key": "accept", "value": "text/markdown" }
      ],
      "destination": "/:path+.md"
    }
  ]
}
```

This works at the Vercel edge — no Astro mode change, no per-request render. Browser requests (`Accept: text/html, …`) keep getting HTML; Markdown-only clients get the `.md`. Equivalent setups exist for Netlify (`_redirects`) and Cloudflare Pages (Workers).

## What's different in this fork

1. **Inlines `starlight-markdown`.** Upstream pulls in [`starlight-markdown`](https://github.com/reynaldichernando/starlight-markdown) as a peer dependency to register the markdown routes. We've inlined that logic (~25 LoC) so the install is self-contained — no second peer dep to track.

2. **URL pattern is `/<slug>.md`** (not `/<slug>/index.md`). Aligns with the convention used by Anthropic, Vercel, and Next.js docs, where every HTML page has a sibling at the same URL with `.md` appended.

3. **View-transitions safe.** Upstream only attaches the menu on `DOMContentLoaded`, which doesn't re-fire during Starlight's SPA-style navigation, so the menu disappears after the first navigation until you refresh. This fork also listens on `astro:page-load` and re-attaches idempotently on every page render.

4. **`MarkdownAlternate.astro` component.** New in 0.3.0 — emits the `<link rel="alternate" type="text/markdown">` tag for pages that have a real Markdown twin, with the OpenAPI / virtual-entry filter built in.

5. **Astro 6 supported.** Peer dep is `astro@^5 || ^6` (upstream is `^5` only).

## Credit

Original plugin and ongoing upstream maintenance by [Reynaldi Chernando / Corsfix](https://github.com/corsfix/starlight-contextual-menu) under MIT. The inlined `markdown-route.js` is adapted from `starlight-markdown@0.1.5` by the same author. Both retain their MIT copyright.

## License

[MIT](LICENSE)
