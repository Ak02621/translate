document.addEventListener("DOMContentLoaded", function () {
  console.log("html2pdf está listo para usarse.");
});

let langOptions = document.querySelectorAll("select");
let fromText = document.querySelector(".fromText");
let a_traducir = document.querySelector(".a_traducir");
let fromvoice = document.querySelector(".desde");
let tovoice = document.querySelector(".a");
let copiar = document.querySelector(".bx-clipboard-plus");
let contadorValores = document.querySelector(".codigo_extencion");
let cambioLenguaje = document.querySelector(".bx-swap-horizontal");
let copyError = document.getElementById("copy_error");
let copyNotification = document.getElementById("notification");
let clearError = document.getElementById("clear_error");
let ErrorDescargar = document.getElementById("descarga_error");

document.addEventListener("DOMContentLoaded", function () {
    let button = document.getElementById("detectLanguageBtn");
    button.classList.add("active"); // Activar efecto visual por defecto

    let typingTimer;
    const typingDelay = 1000; 

    fromText.addEventListener("input", function () {
        if (button.classList.contains("active")) {
            clearTimeout(typingTimer); // Reiniciar el temporizador si el usuario sigue escribiendo
            typingTimer = setTimeout(detectLanguageAndTranslate, typingDelay);
        }
    });

    button.addEventListener("click", function () {
        button.classList.toggle("active"); // Alternar estado activo/desactivo manualmente
    });
});

function detectLanguageAndTranslate() {
    let text = fromText.value.trim();
    let button = document.getElementById("detectLanguageBtn");

    if (text === "" || !button.classList.contains("active")) return;

    let detectLink = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langOptions[1].value}&dt=t&q=${encodeURIComponent(text)}`;

    fetch(detectLink)
        .then((response) => response.json())
        .then((data) => {
            let detectedLang = data[2]; // Detecta el idioma
            if (detectedLang) {
                langOptions[0].value = detectedLang; // Asigna el idioma detectado al selector de origen
            }
            translateText();
        })
        .catch((error) => console.error("Error en la detección de idioma:", error));
}





langOptions.forEach((get, con) => {
  for (let countryCode in language) {
    let selected;
    if (con == 0 && countryCode == "es") {
      selected = "selected";
    } else if (con == 1 && countryCode == "en") {
      selected = "selected";
    }
    let option = `<option value="${countryCode}" ${selected}>${language[countryCode]}</option>`;
    get.insertAdjacentHTML("beforeend", option);
  }
});

langOptions.forEach((select) => {
  select.addEventListener("change", function () {
    speechSynthesis.cancel(); // Detener la voz al cambiar el idioma
    isSpeaking = false;
    fromvoice.classList.remove("playing");
    tovoice.classList.remove("playing");
    detectLanguageAndTranslate();
  });
});


let timeout;
fromText.addEventListener("input", function () {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    let content = encodeURIComponent(fromText.value);
    let fromContent = langOptions[0].value;
    let toContent = langOptions[1].value;

    let transLINK = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromContent}&tl=${toContent}&dt=t&q=${content}`;

    fetch(transLINK)
      .then((response) => response.json())
      .then((data) => {
        let translatedText = data[0].map((segment) => segment[0]).join(" "); 
        a_traducir.value = translatedText;
      })
      .catch((error) => console.error("Error en la traducción:", error));
  }, 500);
});

// ACTUALIZAR TRADUCCIÓN CUANDO SE CAMBIA DE IDIOMA
langOptions.forEach((select) => {
  select.addEventListener("change", function () {
    fromText.dispatchEvent(new Event("input"));
  });
});
// CONTADOR DE CARACTERES
fromText.addEventListener("keyup", function () {
  contadorValores.innerHTML = `${fromText.value.length}/5,000`;
});

// REPRODUCCIÓN DE VOZ
function toggleSpeech(button, textElement, langElement, otherButton) {
    let text = textElement.value.trim();
    let lang = langElement.value;

    if (text === "") return; 

    if (isSpeaking) {
        speechSynthesis.cancel();
        button.classList.remove("playing");
        otherButton.classList.remove("playing"); 
        isSpeaking = false;
    } else {
        speechSynthesis.cancel(); 
        otherButton.classList.remove("playing"); 

        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
        button.classList.add("playing");
        isSpeaking = true;

        utterance.onend = () => {
            button.classList.remove("playing");
            isSpeaking = false;
        };
    }
}

// Aplicar la función a ambos botones
fromvoice.addEventListener("click", function () {
    toggleSpeech(fromvoice, fromText, langOptions[0], tovoice);
});

tovoice.addEventListener("click", function () {
    toggleSpeech(tovoice, a_traducir, langOptions[1], fromvoice);
});


// COPIAR TEXTO
copiar.addEventListener("click", function () {
  if (a_traducir.value.trim() !== "") {
    navigator.clipboard.writeText(a_traducir.value);
    showMessage(copyNotification);
  } else {
    showMessage(copyError);
  }
});
cambioLenguaje.addEventListener("click", function () {
  speechSynthesis.cancel();
  isSpeaking = false; 
  fromvoice.classList.remove("playing");
  tovoice.classList.remove("playing");
  let tempText = fromText.value;
  fromText.value = a_traducir.value;
  a_traducir.value = tempText;
  let tempOpt = langOptions[0].value;
  langOptions[0].value = langOptions[1].value;
  langOptions[1].value = tempOpt;
  fromText.dispatchEvent(new Event("input"));
});

function clearText() {
  if (fromText.value.trim() === "" && a_traducir.value.trim() === "") {
    showMessage(clearError);
  } else {
    speechSynthesis.cancel();
    isSpeaking = false; 
    fromvoice.classList.remove("playing");
    tovoice.classList.remove("playing");
    fromText.value = "";
    a_traducir.value = "";
    contadorValores.innerHTML = "0/5,000";
  }
}

// Función para mostrar mensajes de alerta
function showMessage(element) {
  element.style.opacity = "1";
  element.style.display = "block";

  setTimeout(() => {
    element.style.opacity = "0";
    setTimeout(() => {
      element.style.display = "none";
    }, 300);
  }, 2000);
}

function downloadTxt() {
  let originalText = document.querySelector(".fromText").value.trim();
  let translatedText = document.querySelector(".a_traducir").value.trim();

  if (originalText === "" && translatedText === "") {
    showMessage(ErrorDescargar);
    return;
  }

  let content = `Texto original:\n${originalText}\n\nTexto traducido:\n${translatedText}`;
  let blob = new Blob([content], { type: "text/plain" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "traduccion.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
// Función para descargar el contenido como PDF
function downloadPdf() {
    let originalText = document.querySelector(".fromText").value.trim();
    let translatedText = document.querySelector(".a_traducir").value.trim();

    if (originalText === "" && translatedText === "") {
        showMessage(ErrorDescargar);
        return;
    }

    let content = document.createElement("div");
    content.style.fontFamily = "'Noto Sans', Arial, sans-serif";
    content.style.padding = "20px";
    content.style.backgroundColor = "#ffffff"; 
    content.style.color = "#000000"; 
    content.innerHTML = `
        <h2 style="color: black;">Traducción</h2>
        <p><strong>Texto original:</strong></p>
        <pre style="color: black;">${originalText}</pre>
        <p><strong>Texto traducido:</strong></p>
        <pre style="color: black;">${translatedText}</pre>
    `;

    let nombreArchivo = `Traduccion_${new Date().toISOString().slice(0, 10)}.pdf`;

    setTimeout(() => {
        html2pdf().from(content).set({
            margin: 10,
            filename: nombreArchivo,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        }).save();
    }, 1000);
}

function detectLanguageAndTranslate() {
    let button = document.querySelector(".detect-language");
    button.classList.add("active"); // Activar efecto visual

    let text = fromText.value.trim(); // Detectar desde el campo de entrada

    if (text === "") {
        button.classList.remove("active"); // Quitar efecto si no hay texto
        return;
    }

    let detectLink = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langOptions[1].value}&dt=t&q=${encodeURIComponent(text)}`;

    fetch(detectLink)
        .then((response) => response.json())
        .then((data) => {
            let detectedLang = data[2]; // Detecta el idioma
            langOptions[0].value = detectedLang; // Asigna el idioma detectado al selector de origen
            translateText(); // Traduce automáticamente
            button.classList.remove("active"); // Quitar efecto después de la detección
        })
        .catch((error) => {
            console.error("Error en la detección de idioma:", error);
            button.classList.remove("active"); // Quitar efecto en caso de error
        });
}

document.addEventListener("DOMContentLoaded", function () {
    let button = document.querySelector(".detect-language");
    button.classList.add("active"); // Activar efecto visual por defecto
});


function translateText() {
  let content = fromText.value.trim();
  let fromContent = langOptions[0].value;
  let toContent = langOptions[1].value;

  if (content === "") return;

  let transLINK = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromContent}&tl=${toContent}&dt=t&q=${encodeURIComponent(
    content
  )}`;

  fetch(transLINK)
    .then((response) => response.json())
    .then((data) => {
      let translatedText = data[0].map((segment) => segment[0]).join(" ");
      a_traducir.value = translatedText;
    })
    .catch((error) => console.error("Error en la traducción:", error));
}

fromText.addEventListener("paste", function () {
  setTimeout(detectLanguageAndTranslate, 100); 
});

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");

  let moonButton = document.querySelector(".mn");
  if (document.body.classList.contains("dark-mode")) {
    moonButton.classList.replace("bx-moon", "bx-sun"); // Cambia el icono a sol
  } else {
    moonButton.classList.replace("bx-sun", "bx-moon"); // Vuelve a luna
  }
}
document.addEventListener("DOMContentLoaded", function () {
    speechSynthesis.cancel(); // Detiene cualquier voz en reproducción al cargar la página
    isSpeaking = false; // Reinicia el estado de la voz
    fromvoice.classList.remove("playing");
    tovoice.classList.remove("playing");
});

function checkDarkMode() {
    let currentHour = new Date().getHours(); 
    if (currentHour >= 19) {
        document.body.classList.add("dark-mode"); 
        if(document.body.classList.contains("dark-mode")) {
            document.querySelector(".mn").classList.replace("bx-moon", "bx-sun"); // Cambia el icono a sol
        }
    } else {
        document.body.classList.remove("dark-mode"); 
    }
}

document.addEventListener("DOMContentLoaded", checkDarkMode);
