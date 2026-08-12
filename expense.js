/* =========================================================
   expense.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   EXPENSE MANAGEMENT

   Features:
   ✅ Expense Save
   ✅ Expense Date
   ✅ Expense Head / Category
   ✅ Description
   ✅ Amount
   ✅ Bill / Reference No.
   ✅ Payment Mode
   ✅ Paid To
   ✅ Entered By
   ✅ LocalStorage
   ✅ Expense History
   ✅ Search
   ✅ Total Expense
   ✅ Delete Expense
   ✅ Dashboard Compatible
========================================================= */


/* =========================================================
   1. GLOBAL
========================================================= */

const EXPENSE_KEY = "mgvm_expenses";


/* =========================================================
   2. GET EXPENSES
========================================================= */

function getExpenses() {

    try {

        const data =
            localStorage.getItem(
                EXPENSE_KEY
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
            "Expense Load Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   3. SAVE EXPENSES
========================================================= */

function saveExpenseList(
    list
) {

    try {

        localStorage.setItem(
            EXPENSE_KEY,
            JSON.stringify(list)
        );

        return true;

    }
    catch (error) {

        console.error(
            "Expense Save Error:",
            error
        );

        alert(
            "खर्च data save करताना समस्या आली."
        );

        return false;

    }

}


/* =========================================================
   4. HTML ESCAPE
========================================================= */

function escapeExpenseHTML(
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

function formatExpenseNumber(
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

function formatExpenseDate(
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

function setExpenseTodayDate() {

    const input =
        document.getElementById(
            "expenseDate"
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
   8. GENERATE EXPENSE NUMBER
========================================================= */

function generateExpenseNumber() {

    const expenses =
        getExpenses();


    let maxNumber = 0;


    expenses.forEach(
        function(item) {

            const ref =
                String(
                    item.referenceNo || ""
                );


            const match =
                ref.match(
                    /MGVM-EXP-(\d+)/i
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
        "MGVM-EXP-" +
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
   9. SAVE EXPENSE
========================================================= */

function saveExpense() {

    const date =
        document.getElementById(
            "expenseDate"
        )?.value || "";


    const category =
        document.getElementById(
            "expenseCategory"
        )?.value.trim() || "";


    const description =
        document.getElementById(
            "expenseDescription"
        )?.value.trim() || "";


    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            )?.value || 0
        );


    const referenceInput =
        document.getElementById(
            "expenseReferenceNo"
        );


    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        )?.value || "";


    const paidTo =
        document.getElementById(
            "expensePaidTo"
        )?.value.trim() || "";


    const enteredBy =
        document.getElementById(
            "expenseEnteredBy"
        )?.value.trim() || "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!date) {

        alert(
            "कृपया खर्चाची तारीख निवडा."
        );

        return;

    }


    if (!category) {

        alert(
            "कृपया खर्चाचा प्रकार निवडा."
        );

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य खर्चाची रक्कम टाका."
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
       REFERENCE NUMBER
    ===================================================== */

    let referenceNo =
        referenceInput
            ? referenceInput.value.trim()
            : "";


    if (!referenceNo) {

        referenceNo =
            generateExpenseNumber();

    }



    /* =====================================================
       DUPLICATE REFERENCE
    ===================================================== */

    const expenses =
        getExpenses();


    const duplicate =
        expenses.some(
            function(item) {

                return (
                    String(
                        item.referenceNo || ""
                    )
                    .toLowerCase()
                    ===
                    String(
                        referenceNo
                    )
                    .toLowerCase()
                );

            }
        );


    if (duplicate) {

        alert(
            "हा Bill / Reference Number आधीपासून वापरलेला आहे."
        );

        return;

    }



    /* =====================================================
       CREATE OBJECT
    ===================================================== */

    const transaction = {

        id:
            "EXP-" +
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

        referenceNo:
            referenceNo,

        paymentMode:
            paymentMode,

        paidTo:
            paidTo,

        enteredBy:
            enteredBy,

        createdAt:
            new Date()
                .toISOString()

    };



    /* =====================================================
       SAVE
    ===================================================== */

    expenses.push(
        transaction
    );


    if (
        !saveExpenseList(
            expenses
        )
    ) {

        return;

    }



    /* =====================================================
       SUCCESS
    ===================================================== */

    showExpenseToast(
        "खर्चाची नोंद यशस्वीरित्या सेव्ह झाली."
    );


    clearExpenseForm();


    displayExpenseHistory();


    updateExpenseDashboard();

}


/* =========================================================
   10. CLEAR FORM
========================================================= */

function clearExpenseForm() {

    const fields = [

        "expenseCategory",
        "expenseDescription",
        "expenseAmount",
        "expenseReferenceNo",
        "expensePaymentMode",
        "expensePaidTo",
        "expenseEnteredBy"

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


    setExpenseTodayDate();

}


/* =========================================================
   11. DISPLAY EXPENSE HISTORY
========================================================= */

function displayExpenseHistory() {

    const tbody =
        document.getElementById(
            "expenseTableBody"
        );


    if (!tbody) {

        return;

    }


    const searchInput =
        document.getElementById(
            "expenseSearch"
        );


    const keyword =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    let data =
        getExpenses();


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
                            item.referenceNo || ""
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

                        ||

                        String(
                            item.paidTo || ""
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
            "totalExpense"
        );


    if (totalElement) {

        totalElement.innerHTML =
            `एकूण खर्च: ₹${formatExpenseNumber(total)}`;

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

                    कोणतीही खर्च नोंद सापडली नाही.

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
                    ${formatExpenseDate(
                        item.date
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.category
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.description || "-"
                    )}
                </td>

                <td>
                    ₹${formatExpenseNumber(
                        item.amount
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.referenceNo || "-"
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.paymentMode || "-"
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.paidTo || "-"
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.enteredBy || "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteExpense('${escapeExpenseHTML(item.id)}')"
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
   12. DELETE EXPENSE
========================================================= */

function deleteExpense(
    expenseId
) {

    const confirmDelete =
        confirm(
            "ही खर्चाची नोंद Delete करायची आहे का?"
        );


    if (!confirmDelete) {

        return;

    }


    let expenses =
        getExpenses();


    const exists =
        expenses.some(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        expenseId
                    )
                );

            }
        );


    if (!exists) {

        alert(
            "खर्चाची नोंद सापडली नाही."
        );

        return;

    }


    expenses =
        expenses.filter(
            function(item) {

                return (
                    String(
                        item.id
                    ) !==
                    String(
                        expenseId
                    )
                );

            }
        );


    saveExpenseList(
        expenses
    );


    displayExpenseHistory();

    updateExpenseDashboard();


    showExpenseToast(
        "खर्चाची नोंद Delete झाली."
    );

}


/* =========================================================
   13. DASHBOARD
========================================================= */

function updateExpenseDashboard() {

    const expenses =
        getExpenses();


    const total =
        expenses.reduce(
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
            "totalExpenseDashboard"
        );


    if (totalElement) {

        totalElement.innerText =
            "₹" +
            total.toLocaleString(
                "en-IN"
            );

    }



    /* =====================================================
       TODAY EXPENSE
    ===================================================== */

    const today =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    const todayTotal =
        expenses.reduce(
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
            "todayExpense"
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

const expenseSearch =
    document.getElementById(
        "expenseSearch"
    );


if (expenseSearch) {

    expenseSearch.addEventListener(
        "input",
        function() {

            displayExpenseHistory();

        }
    );

}


/* =========================================================
   15. TOAST
========================================================= */

function showExpenseToast(
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

function initializeExpensePage() {

    setExpenseTodayDate();

    displayExpenseHistory();

    updateExpenseDashboard();

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
        initializeExpensePage
    );

}
else {

    initializeExpensePage();

}


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM expense.js loaded successfully."
);
