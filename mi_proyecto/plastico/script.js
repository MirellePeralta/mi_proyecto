const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// Cargar el modelo y configurar la webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        // Cargar el modelo y los metadatos
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Configurar la webcam
        const flip = true; // Voltear la cámara
        webcam = new tmImage.Webcam(400, 300, flip); // Ancho, alto, flip
        await webcam.setup(); // Solicitar acceso a la cámara
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Agregar elementos al DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (error) {
        console.error("Error al inicializar:", error);
        alert("Ocurrió un error al inicializar la cámara o el modelo. Revisa la consola para más detalles.");
    }
}

// Ciclo para actualizar la webcam y ejecutar predicciones
async function loop() {
    webcam.update(); // Actualizar el marco de la cámara
    await predict();
    window.requestAnimationFrame(loop);
}

// Ejecutar predicción usando la imagen de la webcam
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let highestProbability = 0;
    let highestClassName = "";

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = 
            `${prediction[i].className}: ${(prediction[i].probability * 100).toFixed(2)}%`;
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // Encontrar la clase con mayor probabilidad
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            highestClassName = prediction[i].className;
        }
    }

    // Actualizar el indicador con imágenes o texto
    const indicator = document.getElementById("indicator");
    if (highestClassName.toLowerCase().includes("neutro")) {
        indicator.textContent = "Objeto no válido";
    } else if (highestClassName.toLowerCase().includes("plastico")) {
        indicator.innerHTML = `<img src="images/plastico.png" alt="Plástico" style="width: 500px; height: auto;">`;
    } else if (highestClassName.toLowerCase().includes("nor")) {
        indicator.textContent = "Este tipo de plástico no es reciclable";
    } else {
        indicator.textContent = "-"; // Si no coincide con ninguno
    }

}
