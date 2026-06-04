import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function toBasePath(publicUrl) {
  if (!publicUrl) return '/admin/';

  let pathname = publicUrl;
  try {
    pathname = new URL(publicUrl).pathname;
  } catch (error) {
    pathname = publicUrl;
  }

  let normalized = pathname.trim();
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!normalized.endsWith('/')) normalized = `${normalized}/`;

  return normalized;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = toBasePath(env.PUBLIC_URL).replace(/\/$/, '');

  return {
    plugins: [
      react({
        include: /\.[jt]sx?$/,
      }),
    ],
    base,
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.js$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    server: {
      host: 'localhost',
      port: 8090,
      proxy: env.PUBLIC_URL
        ? {
            '/csrf-token': env.PUBLIC_URL,
            '/get_admin_invite': env.PUBLIC_URL,
            '/trial-request/submit': env.PUBLIC_URL,
            '/login': env.PUBLIC_URL,
            '/manualConnect': env.PUBLIC_URL,
          }
        : undefined,
    },
    preview: {
      host: 'localhost',
      port: 8090,
    },
    define: {
      PUBLIC_URL: JSON.stringify(env.PUBLIC_URL || ''),
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: 'index.html',
          login: 'login.html',
          'trial-request': 'trial-request.html',
          'no-admin-bank': 'no-admin-bank.html',
        },
      },
    },
  };
});
