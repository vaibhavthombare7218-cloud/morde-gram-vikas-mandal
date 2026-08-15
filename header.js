/* =========================================
   MGVM COMMON HEADER
   मोर्डे ग्राम विकास मंडळ, मुंबई
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const pageTitle = document.title || "MGVM";

    const header = document.createElement("header");

    header.className = "mgvm-header";

    header.innerHTML = `
        <div class="mgvm-title">
            🏠 मोर्डे ग्राम विकास मंडळ, मुंबई
        </div>

        <div class="mgvm-subtitle">
            ${pageTitle}
        </div>
    `;

    document.body.insertBefore(
        header,
        document.body.firstChild
    );

});
