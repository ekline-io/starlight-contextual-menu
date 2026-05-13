import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const normalizeConfig = (options = {}) => ({
  actions: ["copy", "view"],
  injectMarkdownRoutes: true,
  ...options,
});

/**
 * Astro integration that registers `/[...path].md` — a parallel Markdown URL
 * for every entry in the `docs` content collection. Matches the `<url>.md`
 * convention used by Anthropic, Vercel, and Next.js docs.
 *
 * Previously delegated to `starlight-markdown@0.1.5`; inlined to drop the
 * extra peer dependency and to switch the URL shape from `/<slug>/index.md`
 * to the canonical `/<slug>.md`.
 */
function markdownRoutesIntegration() {
  return {
    name: "starlight-contextual-menu:markdown-routes",
    hooks: {
      "astro:config:setup": async ({ injectRoute }) => {
        injectRoute({
          pattern: "/[...path].md",
          entrypoint:
            "@ekline-io/starlight-contextual-menu/markdown-route.js",
        });
      },
    },
  };
}

function starlightContextualMenuIntegration(config) {
  const normalizedConfig = normalizeConfig(config);

  return {
    name: "starlight-contextual-menu",
    hooks: {
      "astro:config:setup": async ({ injectScript }) => {
        const contextualMenuContent = readFileSync(
          join(__dirname, "contextual-menu.js"),
          "utf-8"
        );

        injectScript(
          "page",
          `
            ${contextualMenuContent};
            initContextualMenu(${JSON.stringify({
              actions: normalizedConfig.actions,
              hideMainActionLabel: config.hideMainActionLabel,
            })});
          `
        );
      },
    },
  };
}

export default function starlightContextualMenu(userConfig) {
  const config = normalizeConfig(userConfig);

  return {
    name: "starlight-contextual-menu-plugin",
    hooks: {
      "config:setup"({ addIntegration }) {
        if (config.injectMarkdownRoutes !== false) {
          addIntegration(markdownRoutesIntegration());
        }
        addIntegration(starlightContextualMenuIntegration(config));
      },
    },
  };
}
