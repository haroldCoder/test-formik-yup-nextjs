export async function limitConcurrency<T>(
    poolSize: number,
    tasks: (() => Promise<T>)[]
): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = new Array(tasks.length); // array que almacena los resultados en el mismo orden que las tareas
    let index = 0;

    const workers = new Array(poolSize).fill(null).map(async () => { // crear los trabajadores, segun el tamaño del pool
        while (true) {
            const currentIndex = index++; // indice de la tarea actual
            // si el indice es mayor o igual a la longitud de las tareas, romper el bucle
            if (currentIndex >= tasks.length) break;

            try {
                const result = await tasks[currentIndex](); // ejecutar la tarea actual
                results[currentIndex] = { status: 'fulfilled', value: result };
            } catch (err) {
                throw err; // lanzar el error
            }
        }
    });

    await Promise.all(workers); // esperar a que todas las tareas terminen

    return results; // devolver los resultados en el mismo orden que las tareas
}