module.exports = {
    testEnvironment: 'node', // o 'jsdom' si estás probando código que interactúa con el DOM

    // Otras configuraciones opcionales
    verbose: true, // Muestra más detalles de las pruebas en la consola
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["lcov", "text"],
};
