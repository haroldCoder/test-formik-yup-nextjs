// cypress/support/commands.ts
// Comandos custom reutilizables para todos los specs

// ──────────────────────────────────────────────
// Tipos para autocompletado de TypeScript
// ──────────────────────────────────────────────
declare global {
    namespace Cypress {
        interface Chainable {
            /** Intercept /api/upload con respuesta exitosa (200) */
            interceptUploadSuccess(): Chainable<void>;
            /** Intercept /api/upload con respuesta de error (500) */
            interceptUploadError(): Chainable<void>;
            /** Intercept /api/submit con respuesta exitosa (200) */
            interceptSubmit(): Chainable<void>;
            /**
             * Adjunta un archivo al input[data-cy="file-input"].
             * @param fileName  Nombre que tendrá el archivo simulado
             * @param mimeType  MIME type (default: "image/png")
             * @param sizeKB    Tamaño en KB del contenido simulado (default: 10)
             */
            attachFile(fileName: string, mimeType?: string, sizeKB?: number): Chainable<void>;
        }
    }
}

// ──────────────────────────────────────────────
// Implementaciones
// ──────────────────────────────────────────────

Cypress.Commands.add('interceptUploadSuccess', () => {
    cy.intercept('POST', '/api/upload', {
        statusCode: 200,
        fixture: 'upload-success.json',
        // Simular latencia mínima para que el estado "uploading" sea observable
        delay: 100,
    }).as('uploadSuccess');
});

Cypress.Commands.add('interceptUploadError', () => {
    cy.intercept('POST', '/api/upload', {
        statusCode: 500,
        fixture: 'upload-error.json',
        delay: 100,
    }).as('uploadError');
});

Cypress.Commands.add('interceptSubmit', () => {
    cy.intercept('POST', '/api/submit', {
        statusCode: 200,
        fixture: 'submit-success.json',
    }).as('submit');
});

Cypress.Commands.add('attachFile', (fileName: string, mimeType = 'image/png', sizeKB = 10) => {
    // Cypress.selectFile es el método oficial de Cypress para adjuntar archivos a inputs.
    // Funciona correctamente en Chrome, Firefox y Electron sin hacks de asignación.
    // force: true es necesario porque el input tiene className="hidden".
    const content = Cypress.Buffer.from(new Array(sizeKB * 1024).fill('a').join(''));

    cy.get('[data-cy="file-input"]').selectFile(
        {
            contents: content,
            fileName,
            mimeType,
            lastModified: Date.now(),
        },
        { force: true }
    );
});
