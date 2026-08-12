/* =========================================================
   expense.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   EXPENSE MANAGEMENT - CORRECTED FINAL

   HTML IDs MATCHED:
   expenseType
   expenseName
   expenseDate
   expenseAmount
   expensePaymentMode
   expenseBillNo
   expenseDescription
   expenseEnteredBy

   STORAGE:
   mgvm_expenses

   FEATURES:
   ✅ Expense Save
   ✅ Expense Type
   ✅ Paid To / Name
   ✅ Date
   ✅ Amount
   ✅ Payment Mode
   ✅ Bill No.
   ✅ Description
   ✅ Entered By
   ✅ LocalStorage
   ✅ Search
   ✅ Delete
   ✅ Total Expense
   ✅ Today Expense
   ✅ Dashboard Compatible
========================================================= */


/* =========================================================
   1. STORAGE KEY
========================================================= */

const EXPENSE_KEY =
    "mgvm_expenses";


/* =========================================================
   2. GET EXPENSES
========================================================= */

function getExpenses() {

    try {

        const data =
            localStorage.getItem(
                EXPENSE_KEY
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
            "Expense Load Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   3. SAVE EXPENSE LIST
========================================================= */

function saveExpenseList(list) {

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
   4. ESCAPE HTML
========================================================= */

function escapeExpenseHTML(value) {

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

function formatExpenseNumber(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   6. FORMAT DATE
========================================================= */

function formatExpenseDate(dateString) {

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
   8. GENERATE BILL NUMBER
========================================================= */

function generateExpenseNumber() {

    const expenses =
        getExpenses();


    let maxNumber = 0;


    expenses.forEach(
        function(item) {

            const ref =
                String(
                    item.billNo ||
                    item.referenceNo ||
                    ""
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
        ).padStart(
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


    const type =
        document.getElementById(
            "expenseType"
        )?.value.trim() || "";


    const name =
        document.getElementById(
            "expenseName"
        )?.value.trim() || "";


    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            )?.value || 0
        );


    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        )?.value || "";


    const billInput =
        document.getElementById(
            "expenseBillNo"
        );


    const description =
        document.getElementById(
            "expenseDescription"
        )?.value.trim() || "";


    const enteredBy =
        document.getElementById(
            "expenseEnteredBy"
        )?.value.trim() || "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!type) {

        alert(
            "कृपया खर्च प्रकार निवडा."
        );

        return;

    }


    if (!name) {

        alert(
            "कृपया ज्यांना पैसे दिले त्यांचे नाव टाका."
        );

        return;

    }


    if (!date) {

        alert(
            "कृपया खर्चाची तारीख निवडा."
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
       BILL NUMBER
    ===================================================== */

    let billNo =
        billInput
            ? billInput.value.trim()
            : "";


    if (!billNo) {

        billNo =
            generateExpenseNumber();

    }


    /* =====================================================
       DUPLICATE BILL
    ===================================================== */

    const expenses =
        getExpenses();


    const duplicate =
        expenses.some(
            function(item) {

                const oldBill =
                    item.billNo ||
                    item.referenceNo ||
                    "";


                return (
                    String(
                        oldBill
                    )
                    .toLowerCase()
                    ===
                    billNo.toLowerCase()
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
       CREATE TRANSACTION
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

        type:
            type,

        category:
            type,

        name:
            name,

        paidTo:
            name,

        amount:
            amount,

        billNo:
            billNo,

        referenceNo:
            billNo,

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

        "expenseType",
        "expenseName",
        "expenseAmount",
        "expenseBillNo",
        "expensePaymentMode",
        "expenseDescription",
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
                            item.name ||
                            item.paidTo ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.billNo ||
                            item.referenceNo ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.description ||
                            ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                        ||

                        String(
                            item.paymentMode ||
                            ""
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
                    colspan="9"
                    style="text-align:center;"
                >

                    कोणतीही खर्च नोंद सापडली नाही.

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
                    ${formatExpenseDate(
                        item.date
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.type ||
                        item.category ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.name ||
                        item.paidTo ||
                        "-"
                    )}
                </td>

                <td>
                    ₹${formatExpenseNumber(
                        item.amount
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.paymentMode ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.billNo ||
                        item.referenceNo ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeExpenseHTML(
                        item.description ||
                        "-"
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

function deleteExpense(expenseId) {

    if (
        !confirm(
            "ही खर्चाची नोंद Delete करायची आहे का?"
        )
    ) {

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


    if (
        !saveExpenseList(
            expenses
        )
    ) {

        return;

    }


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


    const totalElements = [

        document.getElementById(
            "totalExpenseDashboard"
        ),

        document.getElementById(
            "totalExpense"
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
   14. SEARCH
========================================================= */

function initializeExpenseSearch() {

    const expenseSearch =
        document.getElementById(
            "expenseSearch"
        );


    if (!expenseSearch) {

        return;

    }


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

function showExpenseToast(message) {

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

function initializeExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            saveExpense();

        }
    );


    form.addEventListener(
        "reset",
        function() {

            setTimeout(
                function() {

                    setExpenseTodayDate();

                },
                0
            );

        }
    );

}


/* =========================================================
   17. INITIALIZE
========================================================= */

function initializeExpensePage() {

    setExpenseTodayDate();

    initializeExpenseForm();

    initializeExpenseSearch();

    displayExpenseHistory();

    updateExpenseDashboard();

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
    "MGVM corrected expense.js loaded successfully."
);
