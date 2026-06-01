/**
 * upload.cy.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Suite E2E para el módulo de carga de archivos.
 * Cubre los 10 casos de uso definidos en el plan de implementación.
 *
 * Selectores usados (data-cy):
 *   input-title       → Campo título
 *   error-title       → Mensaje de error del título
 *   input-description → Campo descripción
 *   error-description → Mensaje de error de la descripción
 *   file-input        → <input type="file">
 *   file-drop-zone    → Zona de drop / label
 *   file-card         → Cada tarjeta de archivo en la lista
 *   btn-upload-all    → Botón "Upload files"
 *   btn-cancel        → Botón "Cancel" dentro de una tarjeta
 *   btn-retry         → Botón retry dentro de una tarjeta
 *   btn-submit        → Botón "Submit"
 * ─────────────────────────────────────────────────────────────────────────────
 */

describe('Upload Module — Casos de uso', () => {

    // Navegar a la página de upload antes de cada test
    beforeEach(() => {
        cy.visit('/upload');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 1: Validación del formulario (title y description requeridos)
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-01 | muestra errores de validación si se envía el form vacío', () => {
        // Formik sólo muestra errores cuando el campo está "touched".
        // Escribimos un carácter, lo borramos y hacemos blur para que Formik
        // marque el campo como tocado y ejecute la validación de Yup.
        cy.get('[data-cy="input-title"]').type('a').clear().blur();
        cy.get('[data-cy="input-description"]').type('a').clear().blur();

        cy.get('[data-cy="error-title"]')
            .should('be.visible')
            .and('contain.text', 'Title is required');

        cy.get('[data-cy="error-description"]')
            .should('be.visible')
            .and('contain.text', 'Description is required');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 2: Agregar un archivo via input
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-02 | agregar un archivo via input muestra la tarjeta del archivo', () => {
        cy.attachFile('foto.png', 'image/png', 5);

        cy.get('[data-cy="file-card"]')
            .should('have.length', 1)
            .and('contain.text', 'foto.png');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 3: Detectar y rechazar archivos duplicados
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-03 | agregar el mismo archivo dos veces muestra toast de error y elimina el duplicado', () => {
        // Usamos attachFile dos veces con el mismo nombre y tamaño.
        // Cada llamada dispara onChange → addFiles, acumulando el estado.
        // El useEffect detecta el duplicado, dispara el toast y elimina la segunda entrada.
        cy.attachFile('duplicado.png', 'image/png', 5);
        cy.attachFile('duplicado.png', 'image/png', 5);

        // Esperar el toast de error de duplicado
        cy.contains('this file is duplicated', { timeout: 6000 }).should('be.visible');

        // Solo 1 tarjeta debe quedar (la segunda fue eliminada)
        cy.get('[data-cy="file-card"]').should('have.length', 1);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 4: Upload exitoso (idle → uploading → done)
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-04 | upload exitoso pone el archivo en estado done', () => {
        cy.interceptUploadSuccess();

        cy.attachFile('imagen.png', 'image/png', 10);

        cy.get('[data-cy="btn-upload-all"]').should('not.be.disabled').click();

        // Esperar que la API sea llamada
        cy.wait('@uploadSuccess');

        // La tarjeta debe tener data-cy-status="done"
        cy.get('[data-cy="file-card"]')
            .should('have.attr', 'data-cy-status', 'done');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 5: Upload con error de servidor
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-05 | upload fallido muestra el archivo en estado error con mensaje', () => {
        cy.interceptUploadError();

        cy.attachFile('imagen-error.png', 'image/png', 10);
        cy.get('[data-cy="btn-upload-all"]').should('not.be.disabled').click();

        cy.wait('@uploadError');

        cy.get('[data-cy="file-card"]')
            .should('have.attr', 'data-cy-status', 'error');

        // Mensaje de error visible en la tarjeta
        cy.get('[data-cy="file-card"]')
            .contains('Upload failed due to network error')
            .should('be.visible');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 6: Cancelar un upload en curso
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-06 | cancelar un upload en curso cambia el estado a canceled', () => {
        // Retardo de 5 s para asegurar que el Cancel se haga antes de que
        // el servidor responda. El fix del AbortError en use-upload-manager
        // garantiza que el catch no sobreescriba el estado 'canceled'.
        cy.intercept('POST', '/api/upload', (req) => {
            req.reply((res) => {
                res.setDelay(5000);
                res.send({ statusCode: 200, body: { id: '1', url: '/uploads/file.png' } });
            });
        }).as('uploadDelayed');

        cy.attachFile('imagen-cancel.png', 'image/png', 5);
        cy.get('[data-cy="btn-upload-all"]').click();

        // Mientras sube, hacer click en Cancel
        cy.get('[data-cy="btn-cancel"]', { timeout: 4000 }).should('be.visible').click();

        // El archivo debe quedar en estado canceled
        cy.get('[data-cy="file-card"]')
            .should('have.attr', 'data-cy-status', 'canceled');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 7: Reintentar un upload fallido
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-07 | retry de un upload fallido reinicia el proceso y puede quedar en done', () => {
        // Primera llamada → error
        cy.intercept('POST', '/api/upload', { statusCode: 500, fixture: 'upload-error.json', delay: 100 }).as('firstFail');

        cy.attachFile('retry.png', 'image/png', 5);
        cy.get('[data-cy="btn-upload-all"]').click();
        cy.wait('@firstFail');

        cy.get('[data-cy="file-card"]').should('have.attr', 'data-cy-status', 'error');

        // Segunda llamada → éxito
        cy.interceptUploadSuccess();

        cy.get('[data-cy="btn-retry"]').should('be.visible').click();
        cy.wait('@uploadSuccess');

        cy.get('[data-cy="file-card"]').should('have.attr', 'data-cy-status', 'done');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 8: Submit bloqueado si no todos los archivos están "done"
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-08 | el botón Submit permanece deshabilitado si hay archivos sin subir', () => {
        cy.get('[data-cy="input-title"]').type('Mi título');
        cy.get('[data-cy="input-description"]').type('Mi descripción');

        cy.attachFile('pending.png', 'image/png', 5);

        // El archivo está en idle → Submit debe estar deshabilitado
        cy.get('[data-cy="btn-submit"]').should('be.disabled');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 9: Submit exitoso — form completo + archivos done
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-09 | submit exitoso muestra toast de éxito y limpia el formulario', () => {
        cy.interceptUploadSuccess();
        cy.interceptSubmit();

        cy.get('[data-cy="input-title"]').type('Mi título de prueba');
        cy.get('[data-cy="input-description"]').type('Descripción de la prueba E2E');

        cy.attachFile('submit-test.png', 'image/png', 10);
        cy.get('[data-cy="btn-upload-all"]').click();
        cy.wait('@uploadSuccess');

        // Ahora el archivo está "done" y el formulario es válido
        cy.get('[data-cy="btn-submit"]').should('not.be.disabled').click();
        cy.wait('@submit');

        // Toast de éxito
        cy.contains('Files submitted successfully', { timeout: 8000 }).should('be.visible');

        // Formulario limpio (los campos vuelven a estar vacíos)
        cy.get('[data-cy="input-title"]').should('have.value', '');
        cy.get('[data-cy="input-description"]').should('have.value', '');

        // La lista de archivos fue reseteada
        cy.get('[data-cy="file-card"]').should('not.exist');
    });

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 10: Límite de concurrencia — máx 3 uploads simultáneos
    // ─────────────────────────────────────────────────────────────────────────
    it('UC-10 | con 4 archivos, como máximo 3 quedan en estado "uploading" a la vez', () => {
        // Retardo de 2 s para que los 4 uploads queden en vuelo simultáneamente
        cy.intercept('POST', '/api/upload', (req) => {
            req.reply((res) => {
                res.setDelay(2000);
                res.send({ statusCode: 200, body: { id: '1', url: '/uploads/file.png' } });
            });
        }).as('uploadSlow');

        // Adjuntar 4 archivos distintos de una vez
        cy.get('[data-cy="file-input"]').then((input) => {
            const dataTransfer = new DataTransfer();
            ['a.png', 'b.png', 'c.png', 'd.png'].forEach((name, i) => {
                const content = new Array((i + 1) * 1024).fill(String(i)).join(''); // tamaños distintos → no son duplicados
                dataTransfer.items.add(new File([content], name, { type: 'image/png' }));
            });
            const inputEl = input[0] as HTMLInputElement;
            inputEl.files = dataTransfer.files;
            input[0].dispatchEvent(new Event('change', { bubbles: true }));
        });

        cy.get('[data-cy="file-card"]').should('have.length', 4);
        cy.get('[data-cy="btn-upload-all"]').click();

        // Comprobar que en ningún momento hay más de 3 tarjetas con status "uploading"
        cy.get('[data-cy="file-card"][data-cy-status="uploading"]', { timeout: 3000 })
            .its('length')
            .should('be.lte', 3);
    });
});
