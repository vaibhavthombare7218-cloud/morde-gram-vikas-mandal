/* =========================================================
   income.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   INCOME MANAGEMENT - CORRECTED FINAL

   HTML IDs MATCHED:
   incomeType
   incomeName
   incomeMemberId
   incomeMobile
   incomeDate
   incomeAmount
   incomePaymentMode
   incomeReceiptNo
   incomeDescription
   incomeEnteredBy

   STORAGE:
   mgvm_income

   FEATURES:
   ✅ Income Save
   ✅ Name
   ✅ Member ID
   ✅ Mobile
   ✅ Income Type
   ✅ Date
   ✅ Amount
   ✅ Payment Mode
   ✅ Receipt No.
   ✅ Description
   ✅ Entered By
   ✅ LocalStorage
   ✅ Search
   ✅ Delete
   ✅ Total Income
   ✅ Today Income
   ✅ Dashboard Compatible
========================================================= */


/* =========================================================
   1. STORAGE KEY
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

        if (!data) {

            return [];

        }

        const parsed =
            JSON.parse(data);

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
   3. SAVE INCOME LIST
========================================================= */

function saveIncomeList(list) {

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
            "जमा data save करताना समस्या आली."
        );

        return false;

    }

}


/* =========================================================
   4. ESCAPE HTML
========================================================= */

function escapeIncomeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   5. FORMAT NUMBER
========================================================= */

function formatIncomeNumber(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   6. FORMAT DATE
========================================================= */

function formatIncomeDate(dateString) {

    if (!dateString) {

        return "-";

    }

    const parts =
        String(
            dateString
        ).split("-");

    if (parts.length === 3) {

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
   8. GENERATE RECEIPT NUMBER
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
        ).padStart(
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


    const type =
        document.getElementById(
            "incomeType"
        )?.value.trim() || "";


    const name =
        document.getElementById(
            "incomeName"
        )?.value.trim() || "";


    const memberId =
        document.getElementById(
            "incomeMemberId"
        )?.value.trim() || "";


    const mobile =
        document.getElementById(
            "incomeMobile"
        )?.value.trim() || "";


    const amount =
        Number(
            document.getElementById(
                "incomeAmount"
            )?.value || 0
        );


    const paymentMode =
        document.getElementById(
            "incomePaymentMode"
        )?.value || "";


    const receiptInput =
        document.getElementById(
            "incomeReceiptNo"
        );


    const description =
        document.getElementById(
            "incomeDescription"
        )?.value.trim() || "";


    const enteredBy =
        document.getElementById(
            "incomeEnteredBy"
        )?.value.trim() || "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!type) {

        alert(
            "कृपया जमा प्रकार निवडा."
        );

        return;

    }


    if (!name) {

        alert(
            "कृपया जमा करणाऱ्याचे नाव टाका."
        );

        return;

    }


    if (!date) {

        alert(
            "कृपया जमा तारीख निवडा."
        );

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य जमा रक्कम टाका."
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
       RECEIPT NUMBER
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
                    receiptNo.toLowerCase()
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
       CREATE TRANSACTION
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

        type:
            type,

        category:
            type,

        name:
            name,

        memberId:
            memberId,

        mobile:
            mobile,

        amount:
            amount,

        receiptNo:
            receiptNo,

        paymentMode:
            paymentMode,

        description:
            description,

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
        "जमा नोंद यशस्वीरित्या सेव्ह झाली."
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

        "incomeType",
        "incomeName",
        "incomeMemberId",
        "incomeMobile",
        "incomeAmount",
        "incomeReceiptNo",
        "incomePaymentMode",
        "incomeDescription",
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
   11. DISPLAY HISTORY
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


    /* =====================================================
       SEARCH
    ===================================================== */

    if (keyword) {

        data =
            data.filter(
                function(item) {

                    return (

                        String(
                            item.type ||
                            item.category ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.name || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.memberId || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.mobile || ""
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
                            item.description || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                    );

                }
            );

    }


    /* =====================================================
       SORT
    ===================================================== */

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


    /* =====================================================
       TOTAL
    ===================================================== */

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
            `एकूण जमा: ₹${formatIncomeNumber(total)}`;

    }


    tbody.innerHTML =
        "";


    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="text-align:center;"
                >

                    कोणतीही जमा नोंद सापडली नाही.

                </td>

            </tr>

        `;

        return;

    }


    /* =====================================================
       TABLE
    ===================================================== */

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
                        item.type ||
                        item.category ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.name ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.memberId ||
                        "-"
                    )}
                </td>

                <td>
                    ₹${formatIncomeNumber(
                        item.amount
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.paymentMode ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.receiptNo ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeIncomeHTML(
                        item.description ||
                        "-"
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
   12. DELETE
========================================================= */

function deleteIncome(incomeId) {

    if (
        !confirm(
            "ही जमा नोंद Delete करायची आहे का?"
        )
    ) {

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
            "जमा नोंद सापडली नाही."
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


    if (
        !saveIncomeList(
            income
        )
    ) {

        return;

    }


    displayIncomeHistory();

    updateIncomeDashboard();


    showIncomeToast(
        "जमा नोंद Delete झाली."
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


    const totalElements = [

        document.getElementById(
            "totalIncomeDashboard"
        ),

        document.getElementById(
            "totalIncome"
        )

    ];


    totalElements.forEach(
        function(element) {

            if (element) {

                element.innerText =
                    "₹" +
                    total.toLocaleString(
                        "en-IN"
                    );

            }

        }
    );


    /* =====================================================
       TODAY
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
   14. SEARCH
========================================================= */

function initializeIncomeSearch() {

    const incomeSearch =
        document.getElementById(
            "incomeSearch"
        );


    if (!incomeSearch) {

        return;

    }


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

function showIncomeToast(message) {

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
   16. FORM SUBMIT
========================================================= */

function initializeIncomeForm() {

    const form =
        document.getElementById(
            "incomeForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            saveIncome();

        }
    );


    form.addEventListener(
        "reset",
        function() {

            setTimeout(
                function() {

                    setIncomeTodayDate();

                },
                0
            );

        }
    );

}


/* =========================================================
   17. INITIALIZE
========================================================= */

function initializeIncomePage() {

    setIncomeTodayDate();

    initializeIncomeForm();

    initializeIncomeSearch();

    displayIncomeHistory();

    updateIncomeDashboard();

}


/* =========================================================
   18. DOM READY
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
    "MGVM corrected income.js loaded successfully."
);
