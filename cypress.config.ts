import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    // Esperar hasta 10s que los elementos existan antes de fallar
    defaultCommandTimeout: 10000,
    // Evitar capturas de pantalla en cada fallo (opcional)
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Aqui se pueden registrar plugins de Node si se necesitan
    },
  },
});
