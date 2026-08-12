/* =========================================================
   income.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   INCOME MANAGEMENT

   Features:
   ✅ Income Save
   ✅ Income Date
   ✅ Amount
   ✅ Income Head / Category
   ✅ Description
   ✅ Receipt / Reference No.
   ✅ Payment Mode
   ✅ Entered By
   ✅ LocalStorage
   ✅ Income History
   ✅ Search
   ✅ Total Income
   ✅ Delete Income
   ✅ Dashboard Compatible
========================================================= */


/* =========================================================
   1. GLOBAL
========================================================= */

const INCOME_KEY = "mgvm_income";


/* =========================================================
   2. GET INCOME
========================================================= */

function getIncome() {

    try {

        const data =
            localStorage.getItem(
                INCOME_KEY
            );

        const parsed =
            data
                ? JSON.parse(data)
                : [];

        return Array.isArray(parsed)
            ? parsed
            : [];

    }
    catch (error) {

        console.error(
            "Income Load Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   3. SAVE INCOME
========================================================= */

function saveIncomeList(
    list
) {

    try {

        localStorage.setItem(
            INCOME_KEY,
            JSON.stringify(list)
        );

        return true;

    }
    catch (error) {

        console.error(
            "Income Save Error:",
            error
        );

        alert(
            "उत्पन्न data save करताना समस्या आली."
        );

        return false;

    }

}


/* =========================================================
   4. HTML ESCAPE
========================================================= */

function escapeIncomeHTML(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   5. FORMAT NUMBER
========================================================= */

function formatIncomeNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   6. FORMAT DATE
========================================================= */

function formatIncomeDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const parts =
        String(
            dateString
        ).split("-");


    if (
        parts.length === 3
    ) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return dateString;

}


/* =========================================================
   7. TODAY DATE
========================================================= */

function setIncomeTodayDate() {

    const input =
        document.getElementById(
            "incomeDate"
        );


    if (!input) {

        return;

    }


    const today =
        new Date();


    const yyyy =
        today.getFullYear();


    const mm =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dd =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    input.value =
        `${yyyy}-${mm}-${dd}`;

}


/* =========================================================
   8. GENERATE INCOME RECEIPT
========================================================= */

function generateIncomeReceiptNumber() {

    const income =
        getIncome();


    let maxNumber = 0;


    income.forEach(
        function(item) {

            const receipt =
                String(
                    item.receiptNo || ""
                );


            const match =
                receipt.match(
                    /MGVM-INC-(\d+)/i
                );


            if (!match) {

                return;

            }


            const number =
                parseInt(
                    match[1],
                    10
                );


            if (
                number >
                maxNumber
            ) {

                maxNumber =
                    number;

            }

        }
    );


    return (
        "MGVM-INC-" +
        String(
            maxNumber + 1
        )
        .padStart(
            4,
            "0"
        )
    );

}


/* =========================================================
   9. SAVE INCOME
========================================================= */

function saveIncome() {

    const date =
        document.getElementById(
            "incomeDate"
        )?.value || "";


    const category =
        document.getElementById(
            "incomeCategory"
        )?.value.trim() || "";


    const description =
        document.getElementById(
            "incomeDescription"
        )?.value.trim() || "";


    const amount =
        Number(
            document.getElementById(
                "incomeAmount"
            )?.value || 0
        );


    const receiptInput =
        document.getElementById(
            "incomeReceiptNo"
        );


    const paymentMode =
        document.getElementById(
            "incomePaymentMode"
        )?.value || "";


    const enteredBy =
        document.getElementById(
            "incomeEnteredBy"
        )?.value.trim() || "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!date) {

        alert(
            "कृपया उत्पन्नाची तारीख निवडा."
        );

        return;

    }


    if (!category) {

        alert(
            "कृपया उत्पन्नाचा प्रकार निवडा."
        );

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य उत्पन्न रक्कम टाका."
        );

        return;

    }


    if (!paymentMode) {

        alert(
            "कृपया Payment Mode निवडा."
        );

        return;

    }



    /* =====================================================
       RECEIPT
    ===================================================== */

    let receiptNo =
        receiptInput
            ? receiptInput.value.trim()
            : "";


    if (!receiptNo) {

        receiptNo =
            generateIncomeReceiptNumber();

    }


    /* =====================================================
       DUPLICATE RECEIPT
    ===================================================== */

    const income =
        getIncome();


    const duplicate =
        income.some(
            function(item) {

                return (
                    String(
                        item.receiptNo || ""
                    )
                    .toLowerCase()
                    ===
                    String(
                        receiptNo
                    )
                    .toLowerCase()
                );

            }
        );


    if (duplicate) {

        alert(
            "हा Receipt / Reference Number आधीपासून वापरलेला आहे."
        );

        return;

    }



    /* =====================================================
       CREATE OBJECT
    ===================================================== */

    const transaction = {

        id:
            "INC-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            ),

        date:
            date,

        category:
            category,

        description:
            description,

        amount:
            amount,

        receiptNo:
            receiptNo,

        paymentMode:
            paymentMode,

        enteredBy:
            enteredBy,

        createdAt:
            new Date()
                .toISOString()

    };



    /* =====================================================
       SAVE
    ===================================================== */

    income.push(
        transaction
    );


    if (
        !saveIncomeList(
            income
        )
    ) {

        return;

    }



    /* =====================================================
       SUCCESS
    ===================================================== */

    showIncomeToast(
        "उत्पन्नाची नोंद यशस्वीरित्या सेव्ह झाली."
    );


    clearIncomeForm();


    displayIncomeHistory();


    updateIncomeDashboard();

}


/* =========================================================
   10. CLEAR FORM
========================================================= */

function clearIncomeForm() {

    const fields = [

        "incomeCategory",
        "incomeDescription",
        "incomeAmount",
        "incomeReceiptNo",
        "incomePaymentMode",
        "incomeEnteredBy"

    ];


    fields.forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.value =
                    "";

            }

        }
    );


    setIncomeTodayDate();

}


/* =========================================================
   11. DISPLAY INCOME HISTORY
========================================================= */

function displayIncomeHistory() {

    const tbody =
        document.getElementById(
            "incomeTableBody"
        );


    if (!tbody) {

        return;

    }


    const searchInput =
        document.getElementById(
            "incomeSearch"
        );


    const keyword =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    let data =
        getIncome();


    if (keyword) {

        data =
            data.filter(
                function(item) {

                    return (

                        String(
                            item.category || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.description || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.receiptNo || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.paymentMode || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                    );

                }
            );

    }


    data.sort(
        function(a, b) {

            return (
                new Date(
                    b.date
                )
                -
                new Date(
                    a.date
                )
            );

        }
    );


    const total =
        data.reduce(
            function(
                sum,
                item
            ) {

                return (
                    sum +
                    Number(
                        item.amount || 0
                    )
                );

            },
            0
        );


    const totalElement =
        document.getElementById(
            "totalIncome"
        );


    if (totalElement) {

        totalElement.innerHTML =
            `एकूण उत्पन्न: ₹${formatIncomeNumber(total)}`;

    }


    tbody.innerHTML =
        "";


    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="text-align:center;"
                >

                    कोणतीही उत्पन्न नोंद सापडली नाही.

                </td>

            </tr>

        `;

        return;

    }


    data.forEach(
        function(
            item,
            index
        ) {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatIncomeDate(
                        item.date
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.category
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.description || "-"
                    )}
                </td>

                <td>
                    ₹${formatIncomeNumber(
                        item.amount
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.receiptNo || "-"
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.paymentMode || "-"
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.enteredBy || "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteIncome('${escapeIncomeHTML(item.id)}')"
                    >

                        <i class="fa fa-trash"></i>

                    </button>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   12. DELETE INCOME
========================================================= */

function deleteIncome(
    incomeId
) {

    const confirmDelete =
        confirm(
            "ही उत्पन्न नोंद Delete करायची आहे का?"
        );


    if (!confirmDelete) {

        return;

    }


    let income =
        getIncome();


    const exists =
        income.some(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        incomeId
                    )
                );

            }
        );


    if (!exists) {

        alert(
            "उत्पन्न नोंद सापडली नाही."
        );

        return;

    }


    income =
        income.filter(
            function(item) {

                return (
                    String(
                        item.id
                    ) !==
                    String(
                        incomeId
                    )
                );

            }
        );


    saveIncomeList(
        income
    );


    displayIncomeHistory();

    updateIncomeDashboard();


    showIncomeToast(
        "उत्पन्न नोंद Delete झाली."
    );

}


/* =========================================================
   13. DASHBOARD
========================================================= */

function updateIncomeDashboard() {

    const income =
        getIncome();


    const total =
        income.reduce(
            function(
                sum,
                item
            ) {

                return (
                    sum +
                    Number(
                        item.amount || 0
                    )
                );

            },
            0
        );


    const totalElement =
        document.getElementById(
            "totalIncomeDashboard"
        );


    if (totalElement) {

        totalElement.innerText =
            "₹" +
            total.toLocaleString(
                "en-IN"
            );

    }


    /* =====================================================
       TODAY INCOME
    ===================================================== */

    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    const todayTotal =
        income.reduce(
            function(
                sum,
                item
            ) {

                if (
                    item.date ===
                    today
                ) {

                    return (
                        sum +
                        Number(
                            item.amount || 0
                        )
                    );

                }


                return sum;

            },
            0
        );


    const todayElement =
        document.getElementById(
            "todayIncome"
        );


    if (todayElement) {

        todayElement.innerText =
            "₹" +
            todayTotal.toLocaleString(
                "en-IN"
            );

    }

}


/* =========================================================
   14. SEARCH EVENT
========================================================= */

const incomeSearch =
    document.getElementById(
        "incomeSearch"
    );


if (incomeSearch) {

    incomeSearch.addEventListener(
        "input",
        function() {

            displayIncomeHistory();

        }
    );

}


/* =========================================================
   15. TOAST
========================================================= */

function showIncomeToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        alert(message);

        return;

    }


    toast.innerHTML =
        message;


    toast.style.display =
        "block";


    setTimeout(
        function() {

            toast.style.display =
                "none";

        },
        2500
    );

}


/* =========================================================
   16. INITIALIZE
========================================================= */

function initializeIncomePage() {

    setIncomeTodayDate();

    displayIncomeHistory();

    updateIncomeDashboard();

}


/* =========================================================
   17. DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeIncomePage
    );

}
else {

    initializeIncomePage();

}


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM income.js loaded successfully."
);
