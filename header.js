/* =====================================================
   header.js
   MGVM COMMON HEADER
   मोर्डे ग्राम विकास मंडळ, मुंबई

   हा Header सर्व Pages वर समान Format मध्ये दिसेल.
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ===============================
       PAGE TITLE
    =============================== */

    const pageTitles = {

        "index.html":
            "डॅशबोर्ड",

        "members.html":
            "सभासद व्यवस्थापन",

        "subscription.html":
            "वर्गणी व्यवस्थापन",

        "donation.html":
            "देणगी व्यवस्थापन",

        "income.html":
            "उत्पन्न व्यवस्थापन",

        "expense.html":
            "खर्च व्यवस्थापन",

        "reports.html":
            "अहवाल",

        "member-profile.html":
            "सभासद माहिती"

       "dashboard.html":
            "मुख्य माहिती फलक"
   
    };


    /* ===============================
       CURRENT PAGE
    =============================== */

    let currentPage =
        window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    if (currentPage === "") {
        currentPage = "index.html";
    }


    const pageTitle =
        pageTitles[currentPage] ||
        "मोर्डे ग्राम विकास मंडळ";


    /* ===============================
       CREATE HEADER
    =============================== */

    const header = document.createElement("header");

    header.className = "mgvm-header";


    header.innerHTML = `

        <div class="mgvm-title">
            🏠 मोर्डे ग्राम विकास मंडळ, मुंबई
        </div>

        <div class="mgvm-subtitle">
            ${pageTitle} | मोर्डे ग्राम विकास मंडळ
        </div>

    `;


    /* ===============================
       INSERT HEADER
    =============================== */

    document.body.insertBefore(
        header,
        document.body.firstChild
    );

});
