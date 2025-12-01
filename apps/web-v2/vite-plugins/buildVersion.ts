import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

/**
 * Vite plugin to inject build version hash into index.html
 * This enables automatic cache invalidation on deployments
 */
export function buildVersionPlugin(): Plugin {
  let buildVersion: string;

  return {
    name: 'build-version-injector',
    enforce: 'post',

    configResolved() {
      // Generate a unique build version hash based on package.json and timestamp
      // This ensures each build has a unique identifier
      try {
        const packageJson = readFileSync('./package.json', 'utf-8');
        const timestamp = Date.now().toString();

        buildVersion = createHash('md5')
          .update(packageJson + timestamp)
          .digest('hex')
          .substring(0, 12); // Short hash like: "a3f5b9c2d4e1"

        console.log(`[BuildVersion] Generated build version: ${buildVersion}`);
      } catch {
        console.warn('[BuildVersion] Failed to generate build version, using timestamp');
        buildVersion = Date.now().toString();
      }
    },

    transformIndexHtml(html) {
      // Inject the build version as a meta tag in the HTML head
      return html.replace(
        '</head>',
        `  <meta name="build-version" content="${buildVersion}" />\n  </head>`
      );
    },
  };
}
