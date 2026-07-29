import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  // depending on your application, base can also be "/"
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  // Railway asigna su propio puerto en runtime vía process.env.PORT — hay que
  // escucharlo ahí, VITE_PORT queda solo como fallback para desarrollo local.
  const PORT = process.env.PORT || env.VITE_PORT || 3000;

  // Desde Vite 5.4/6 el dev server (y el preview) verifican el header Host
  // por seguridad (protección contra DNS rebinding) y bloquean cualquier
  // host que no esté en esta lista. Railway sirve la app detrás de un
  // dominio *.up.railway.app, así que hay que permitirlo explícitamente.
  // RAILWAY_PUBLIC_DOMAIN lo inyecta Railway automáticamente en runtime;
  // el ".up.railway.app" con el punto inicial permite cualquier subdominio
  // (útil si el dominio cambia entre deploys).
  const allowedHosts = [env.RAILWAY_PUBLIC_DOMAIN, '.up.railway.app', 'localhost'].filter(Boolean);

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true,
      allowedHosts
    },
    build: {
      chunkSizeWarningLimit: 1600
    },
    preview: {
      open: true,
      port: PORT,
      host: true,
      allowedHosts
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: {
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // }
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
      }
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()]
  };
});
