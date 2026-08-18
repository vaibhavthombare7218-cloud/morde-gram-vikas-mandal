/* =========================================================
   reports.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   COMPLETE FINANCIAL REPORT

   Transaction Sections:
   ✅ जमा Transactions
   ✅ वर्गणी Transactions
   ✅ खर्च Transactions

   Sources:
   ✅ mgvm_income
   ✅ mgvm_expenses
   ✅ mgvm_subscriptions
   ✅ mgvm_donations
   ✅ mgvm_members

   Features:
   ✅ Total Income
   ✅ Total Expense
   ✅ Balance
   ✅ Subscription
   ✅ Donation
   ✅ Other Income
   ✅ Expense Category
   ✅ Wadi Subscription
   ✅ Wadi Donation
   ✅ From-To Date
   ✅ Financial Year
   ✅ Transaction Type
   ✅ Separate Transactions
   ✅ Print
   ✅ Excel
   ✅ CSV
   ✅ Dashboard
========================================================= */


/* =========================================================
   1. STORAGE KEYS
========================================================= */

const REPORT_INCOME_KEY =
    "mgvm_income";

const REPORT_EXPENSE_KEY =
    "mgvm_expenses";

const REPORT_SUBSCRIPTION_KEY =
    "mgvm_subscriptions";

const REPORT_DONATION_KEY =
    "mgvm_donations";

const REPORT_MEMBER_KEY =
    "mgvm_members";


/* =========================================================
   2. GLOBAL DATA
========================================================= */

let reportData = {

    income: [],

    expenses: [],

    subscriptions: [],

    donations: [],

    members: []

};


let filteredTransactions = [];


/* =========================================================
   3. GET STORAGE
========================================================= */

function reportGetStorage(key) {

    try {

        const data =
            localStorage.getItem(key);

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
            "Report storage error:",
            key,
            error
        );

        return [];

    }

}


/* =========================================================
   4. LOAD ALL DATA
========================================================= */

function loadReportData() {

    reportData.income =
        reportGetStorage(
            REPORT_INCOME_KEY
        );

    reportData.expenses =
        reportGetStorage(
            REPORT_EXPENSE_KEY
        );

    reportData.subscriptions =
        reportGetStorage(
            REPORT_SUBSCRIPTION_KEY
        );

    reportData.donations =
        reportGetStorage(
            REPORT_DONATION_KEY
        );

    reportData.members =
        reportGetStorage(
            REPORT_MEMBER_KEY
        );

}


/* =========================================================
   5. NUMBER
========================================================= */

function reportNumber(value) {

    const number =
        Number(value || 0);

    return number.toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   6. MONEY
========================================================= */

function reportMoney(value) {

    return (
        "₹" +
        reportNumber(value)
    );

}


/* =========================================================
   7. ESCAPE HTML
========================================================= */

function reportEscape(value) {

    return String(
        value ?? ""
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
   8. DATE FORMAT
========================================================= */

function reportFormatDate(date) {

    if (!date) {

        return "-";

    }

    const value =
        String(date);

    const parts =
        value.split("-");

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

    return value;

}


/* =========================================================
   9. FINANCIAL YEAR
========================================================= */

function reportFinancialYear(date) {

    if (!date) {

        return "";

    }

    const parts =
        String(date).split("-");

    if (
        parts.length !== 3
    ) {

        return "";

    }

    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    /*
       April to March
    */

    if (month >= 4) {

        return (
            year +
            "-" +
            String(
                year + 1
            ).slice(-2)
        );

    }

    return (
        year - 1 +
        "-" +
        String(
            year
        ).slice(-2)
    );

}


/* =========================================================
   10. GET MEMBER WADI
========================================================= */

function getMemberWadi(memberId) {

    if (!memberId) {

        return "";

    }

    const member =
        reportData.members.find(
            function(item) {

                return (
                    String(
                        item.id ||
                        item.memberId ||
                        ""
                    )
                    .toLowerCase()
                    ===
                    String(
                        memberId
                    )
                    .toLowerCase()
                );

            }
        );

    return member
        ? (
            member.wadi ||
            ""
        )
        : "";

}


/* =========================================================
   11. BUILD TRANSACTIONS
========================================================= */

function buildAllTransactions() {

    const transactions = [];


    /* =====================================================
       INCOME
    ===================================================== */

    reportData.income.forEach(
        function(item) {

            transactions.push({

                date:
                    item.date || "",

                type:
                    "जमा",

                name:
                    item.category ||
                    "इतर जमा",

                wadi:
                    "",

                description:
                    item.description ||
                    "",

                income:
                    Number(
                        item.amount || 0
                    ),

                expense:
                    0,

                reference:
                    item.receiptNo ||
                    "",

                paymentMode:
                    item.paymentMode ||
                    "",

                source:
                    "income"

            });

        }
    );


    /* =====================================================
       EXPENSE
    ===================================================== */

    reportData.expenses.forEach(
        function(item) {

            transactions.push({

                date:
                    item.date || "",

                type:
                    "खर्च",

                name:
                    item.category ||
                    "",

                wadi:
                    "",

                description:
                    item.description ||
                    "",

                income:
                    0,

                expense:
                    Number(
                        item.amount || 0
                    ),

                reference:
                    item.referenceNo ||
                    "",

                paymentMode:
                    item.paymentMode ||
                    "",

                source:
                    "expense"

            });

        }
    );


    /* =====================================================
       SUBSCRIPTION
    ===================================================== */

    reportData.subscriptions.forEach(
        function(item) {

            transactions.push({

                date:
                    item.paymentDate ||
                    "",

                type:
                    "वर्गणी",

                name:
                    item.memberName ||
                    "",

                wadi:
                    item.wadi ||
                    getMemberWadi(
                        item.memberId
                    ),

                description:
                    "वर्गणी " +
                    (
                        item.year ||
                        ""
                    ),

                income:
                    Number(
                        item.paidAmount ||
                        0
                    ),

                expense:
                    0,

                reference:
                    item.receiptNo ||
                    "",

                paymentMode:
                    item.paymentMode ||
                    "",

                source:
                    "subscription"

            });

        }
    );


    /* =====================================================
       DONATION
       Donation is income but kept separately as source
       so donation filter and summary continue working.
    ===================================================== */

    reportData.donations.forEach(
        function(item) {

            transactions.push({

                date:
                    item.donationDate ||
                    "",

                type:
                    "देणगी",

                name:
                    item.donorName ||
                    "",

                wadi:
                    item.wadi ||
                    getMemberWadi(
                        item.memberId
                    ),

                description:
                    item.memberId
                        ? "सभासद देणगी"
                        : "Non-Member Donation",

                income:
                    Number(
                        item.amount ||
                        0
                    ),

                expense:
                    0,

                reference:
                    item.receiptNo ||
                    "",

                paymentMode:
                    item.paymentMode ||
                    "",

                source:
                    "donation"

            });

        }
    );


    return transactions;

}


/* =========================================================
   12. LOAD FINANCIAL YEARS
========================================================= */

function loadFinancialYears() {

    const select =
        document.getElementById(
            "reportFinancialYear"
        );

    if (!select) {

        return;

    }

    const years =
        new Set();

    buildAllTransactions()
        .forEach(
            function(item) {

                const fy =
                    reportFinancialYear(
                        item.date
                    );

                if (fy) {

                    years.add(fy);

                }

            }
        );


    select.innerHTML = `

        <option value="">
            सर्व Financial Year
        </option>

    `;


    Array.from(years)
        .sort()
        .reverse()
        .forEach(
            function(year) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    year;

                option.textContent =
                    year;

                select.appendChild(
                    option
                );

            }
        );

}


/* =========================================================
   13. APPLY FILTER
========================================================= */

function applyReportFilter() {

    const fromDate =
        document.getElementById(
            "reportFromDate"
        )?.value || "";


    const toDate =
        document.getElementById(
            "reportToDate"
        )?.value || "";


    const financialYear =
        document.getElementById(
            "reportFinancialYear"
        )?.value || "";


    const transactionType =
        document.getElementById(
            "reportTransactionType"
        )?.value ||
        "all";


    if (
        fromDate &&
        toDate &&
        fromDate > toDate
    ) {

        alert(
            "From Date ही To Date पेक्षा मोठी असू शकत नाही."
        );

        return;

    }


    loadReportData();


    let transactions =
        buildAllTransactions();


    transactions =
        transactions.filter(
            function(item) {

                /* DATE */

                if (
                    fromDate &&
                    item.date < fromDate
                ) {

                    return false;

                }


                if (
                    toDate &&
                    item.date > toDate
                ) {

                    return false;

                }


                /* FINANCIAL YEAR */

                if (
                    financialYear &&
                    reportFinancialYear(
                        item.date
                    ) !==
                    financialYear
                ) {

                    return false;

                }


                /* TRANSACTION TYPE */

                if (
                    transactionType !==
                    "all" &&
                    item.source !==
                    transactionType
                ) {

                    return false;

                }


                return true;

            }
        );


    filteredTransactions =
        transactions;


    renderReport(
        transactions
    );

}


/* =========================================================
   14. RESET FILTER
========================================================= */

function resetReportFilter() {

    const fromDate =
        document.getElementById(
            "reportFromDate"
        );


    const toDate =
        document.getElementById(
            "reportToDate"
        );


    const financialYear =
        document.getElementById(
            "reportFinancialYear"
        );


    const type =
        document.getElementById(
            "reportTransactionType"
        );


    if (fromDate) {

        fromDate.value = "";

    }


    if (toDate) {

        toDate.value = "";

    }


    if (financialYear) {

        financialYear.value = "";

    }


    if (type) {

        type.value = "all";

    }


    loadReportData();


    filteredTransactions =
        buildAllTransactions();


    renderReport(
        filteredTransactions
    );

}


/* =========================================================
   15. RENDER REPORT
========================================================= */

function renderReport(
    transactions
) {

    renderSummary(
        transactions
    );


    renderExpenseCategories(
        transactions
    );


    renderWadiSubscriptions(
        transactions
    );


    renderWadiDonations(
        transactions
    );


    renderIncomeTransactions(
        transactions
    );


    renderSubscriptionTransactions(
        transactions
    );


    renderExpenseTransactions(
        transactions
    );


    updateReportPeriod();

}


/* =========================================================
   16. SUMMARY
========================================================= */

function renderSummary(
    transactions
) {

    let totalIncome = 0;

    let totalExpense = 0;

    let totalSubscription = 0;

    let totalDonation = 0;


    transactions.forEach(
        function(item) {

            totalIncome +=
                Number(
                    item.income || 0
                );


            totalExpense +=
                Number(
                    item.expense || 0
                );


            if (
                item.source ===
                "subscription"
            ) {

                totalSubscription +=
                    Number(
                        item.income || 0
                    );

            }


            if (
                item.source ===
                "donation"
            ) {

                totalDonation +=
                    Number(
                        item.income || 0
                    );

            }

        }
    );


    /*
       Other Income:
       Only mgvm_income transactions.
       Subscription and Donation excluded.
    */

    const otherIncome =
        transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "income"
                );

            }
        )
        .reduce(
            function(
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.income || 0
                    )
                );

            },
            0
        );


    const balance =
        totalIncome -
        totalExpense;


    setReportText(
        "reportTotalIncome",
        reportMoney(
            totalIncome
        )
    );


    setReportText(
        "reportTotalSubscription",
        reportMoney(
            totalSubscription
        )
    );


    setReportText(
        "reportTotalDonation",
        reportMoney(
            totalDonation
        )
    );


    setReportText(
        "reportOtherIncome",
        reportMoney(
            otherIncome
        )
    );


    setReportText(
        "reportTotalExpense",
        reportMoney(
            totalExpense
        )
    );


    setReportText(
        "reportBalance",
        reportMoney(
            balance
        )
    );

}


/* =========================================================
   17. SET TEXT
========================================================= */

function setReportText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            value;

    }

}


/* =========================================================
   18. EXPENSE CATEGORY
========================================================= */

function renderExpenseCategories(
    transactions
) {

    const tbody =
        document.getElementById(
            "expenseCategoryBody"
        );


    const totalElement =
        document.getElementById(
            "expenseCategoryTotal"
        );


    if (!tbody) {

        return;

    }


    const map = {};


    transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "expense"
                );

            }
        )
        .forEach(
            function(item) {

                const category =
                    item.name ||
                    "इतर खर्च";


                if (
                    !map[category]
                ) {

                    map[category] = 0;

                }


                map[category] +=
                    Number(
                        item.expense || 0
                    );

            }
        );


    const rows =
        Object.entries(map)
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        );


    tbody.innerHTML = "";


    let total = 0;


    rows.forEach(
        function(
            row,
            index
        ) {

            total += row[1];


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${reportEscape(
                            row[0]
                        )}
                    </td>

                    <td>
                        ${reportMoney(
                            row[1]
                        )}
                    </td>

                </tr>

            `;

        }
    );


    if (
        rows.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty-row"
                >

                    खर्चाची नोंद उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    if (totalElement) {

        totalElement.innerText =
            "एकूण: " +
            reportMoney(total);

    }

}


/* =========================================================
   19. WADI SUBSCRIPTION
========================================================= */

function renderWadiSubscriptions(
    transactions
) {

    const tbody =
        document.getElementById(
            "wadiSubscriptionBody"
        );


    const totalElement =
        document.getElementById(
            "wadiSubscriptionTotal"
        );


    if (!tbody) {

        return;

    }


    const map = {};


    transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "subscription"
                );

            }
        )
        .forEach(
            function(item) {

                const wadi =
                    item.wadi ||
                    "वाडी उपलब्ध नाही";


                if (
                    !map[wadi]
                ) {

                    map[wadi] = 0;

                }


                map[wadi] +=
                    Number(
                        item.income || 0
                    );

            }
        );


    const rows =
        Object.entries(map)
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        );


    tbody.innerHTML = "";


    let total = 0;


    rows.forEach(
        function(
            row,
            index
        ) {

            total += row[1];


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${reportEscape(
                            row[0]
                        )}
                    </td>

                    <td>
                        ${reportMoney(
                            row[1]
                        )}
                    </td>

                </tr>

            `;

        }
    );


    if (
        rows.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty-row"
                >

                    वर्गणीची नोंद उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    if (totalElement) {

        totalElement.innerText =
            "एकूण: " +
            reportMoney(total);

    }

}


/* =========================================================
   20. WADI DONATION
========================================================= */

function renderWadiDonations(
    transactions
) {

    const tbody =
        document.getElementById(
            "wadiDonationBody"
        );


    const totalElement =
        document.getElementById(
            "wadiDonationTotal"
        );


    if (!tbody) {

        return;

    }


    const map = {};


    transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "donation"
                );

            }
        )
        .forEach(
            function(item) {

                const wadi =
                    item.wadi ||
                    "वाडी उपलब्ध नाही";


                if (
                    !map[wadi]
                ) {

                    map[wadi] = 0;

                }


                map[wadi] +=
                    Number(
                        item.income || 0
                    );

            }
        );


    const rows =
        Object.entries(map)
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        );


    tbody.innerHTML = "";


    let total = 0;


    rows.forEach(
        function(
            row,
            index
        ) {

            total += row[1];


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${reportEscape(
                            row[0]
                        )}
                    </td>

                    <td>
                        ${reportMoney(
                            row[1]
                        )}
                    </td>

                </tr>

            `;

        }
    );


    if (
        rows.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty-row"
                >

                    देणगीची नोंद उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    if (totalElement) {

        totalElement.innerText =
            "एकूण: " +
            reportMoney(total);

    }

}


/* =========================================================
   21. SORT TRANSACTIONS
========================================================= */

function sortReportTransactions(
    transactions
) {

    return [...transactions]
        .sort(
            function(a, b) {

                return (
                    String(
                        b.date || ""
                    )
                    .localeCompare(
                        String(
                            a.date || ""
                        )
                    )
                );

            }
        );

}


/* =========================================================
   22. RENDER COMMON TABLE ROW
========================================================= */

function buildTransactionRow(
    item,
    index
) {

    return `

        <tr>

            <td>
                ${index + 1}
            </td>

            <td>
                ${reportFormatDate(
                    item.date
                )}
            </td>

            <td>
                ${reportEscape(
                    item.type
                )}
            </td>

            <td>
                ${reportEscape(
                    item.name
                )}
            </td>

            <td>
                ${reportEscape(
                    item.wadi || "-"
                )}
            </td>

            <td>
                ${reportEscape(
                    item.description ||
                    "-"
                )}
            </td>

            <td>
                ${
                    item.income > 0
                    ?
                    reportMoney(
                        item.income
                    )
                    :
                    "-"
                }
            </td>

            <td>
                ${reportEscape(
                    item.reference ||
                    "-"
                )}
            </td>

            <td>
                ${reportEscape(
                    item.paymentMode ||
                    "-"
                )}
            </td>

        </tr>

    `;

}


/* =========================================================
   23. RENDER जमा TRANSACTIONS
========================================================= */

function renderIncomeTransactions(
    transactions
) {

    const tbody =
        document.getElementById(
            "incomeTransactionsBody"
        );


    const totalElement =
        document.getElementById(
            "incomeTransactionsTotal"
        );


    if (!tbody) {

        return;

    }


    /*
       जमा section मध्ये:
       1. Normal Income
       2. Donation

       Subscription वेगळ्या section मध्ये.
    */

    const data =
        sortReportTransactions(
            transactions.filter(
                function(item) {

                    return (
                        item.source ===
                        "income" ||
                        item.source ===
                        "donation"
                    );

                }
            )
        );


    tbody.innerHTML = "";


    let total = 0;


    data.forEach(
        function(
            item,
            index
        ) {

            total +=
                Number(
                    item.income || 0
                );


            tbody.innerHTML +=
                buildTransactionRow(
                    item,
                    index
                );

        }
    );


    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty-row"
                >

                    जमा Transaction उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    if (totalElement) {

        totalElement.innerText =
            "एकूण जमा: " +
            reportMoney(total);

    }

}


/* =========================================================
   24. RENDER वर्गणी TRANSACTIONS
========================================================= */

function renderSubscriptionTransactions(
    transactions
) {

    const tbody =
        document.getElementById(
            "subscriptionTransactionsBody"
        );


    const totalElement =
        document.getElementById(
            "subscriptionTransactionsTotal"
        );


    if (!tbody) {

        return;

    }


    const data =
        sortReportTransactions(
            transactions.filter(
                function(item) {

                    return (
                        item.source ===
                        "subscription"
                    );

                }
            )
        );


    tbody.innerHTML = "";


    let total = 0;


    data.forEach(
        function(
            item,
            index
        ) {

            total +=
                Number(
                    item.income || 0
                );


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${reportFormatDate(
                            item.date
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.description
                                .replace(
                                    "वर्गणी ",
                                    ""
                                ) ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.wadi ||
                            "-"
                        )}
                    </td>

                    <td>
                        वर्गणी

                    </td>

                    <td>
                        ${reportMoney(
                            item.income
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.reference ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.paymentMode ||
                            "-"
                        )}
                    </td>

                </tr>

            `;

        }
    );


    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty-row"
                >

                    वर्गणी Transaction उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    if (totalElement) {

        totalElement.innerText =
            "एकूण वर्गणी: " +
            reportMoney(total);

    }

}


/* =========================================================
   25. RENDER खर्च TRANSACTIONS
========================================================= */

function renderExpenseTransactions(
    transactions
) {

    const tbody =
        document.getElementById(
            "expenseTransactionsBody"
        );


    const totalElement =
        document.getElementById(
            "expenseTransactionsTotal"
        );


    if (!tbody) {

        return;

    }


    const data =
        sortReportTransactions(
            transactions.filter(
                function(item) {

                    return (
                        item.source ===
                        "expense"
                    );

                }
            )
        );


    tbody.innerHTML = "";


    let total = 0;


    data.forEach(
        function(
            item,
            index
        ) {

            total +=
                Number(
                    item.expense || 0
                );


            tbody.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${reportFormatDate(
                            item.date
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.description ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportMoney(
                            item.expense
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.paymentMode ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.reference ||
                            "-"
                        )}
                    </td>

                </tr>

            `;

        }
    );


    if (
        data.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-row"
                >

                    खर्च Transaction उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    if (totalElement) {

        totalElement.innerText =
            "एकूण खर्च: " +
            reportMoney(total);

    }

}


/* =========================================================
   26. REPORT PERIOD
========================================================= */

function updateReportPeriod() {

    const element =
        document.getElementById(
            "reportPeriod"
        );


    if (!element) {

        return;

    }


    const from =
        document.getElementById(
            "reportFromDate"
        )?.value || "";


    const to =
        document.getElementById(
            "reportToDate"
        )?.value || "";


    const fy =
        document.getElementById(
            "reportFinancialYear"
        )?.value || "";


    const type =
        document.getElementById(
            "reportTransactionType"
        )?.value ||
        "all";


    let text =
        "सर्व नोंदी";


    if (from || to) {

        text =
            "कालावधी: " +

            (
                from
                    ? reportFormatDate(from)
                    : "सुरुवातीपासून"
            ) +

            " ते " +

            (
                to
                    ? reportFormatDate(to)
                    : "आजपर्यंत"
            );

    }


    if (fy) {

        text +=
            " | Financial Year: " +
            fy;

    }


    if (
        type !== "all"
    ) {

        const names = {

            income:
                "जमा",

            expense:
                "खर्च",

            subscription:
                "वर्गणी",

            donation:
                "देणगी"

        };


        text +=
            " | प्रकार: " +
            (
                names[type] ||
                type
            );

    }


    element.innerText =
        text;

}


/* =========================================================
   27. PRINT
========================================================= */

function printReport() {

    window.print();

}


/* =========================================================
   28. CSV ESCAPE
========================================================= */

function csvValue(value) {

    const text =
        String(
            value ?? ""
        );


    return (
        '"' +
        text.replace(
            /"/g,
            '""'
        ) +
        '"'
    );

}


/* =========================================================
   29. GET CSV ROWS
========================================================= */

function getCSVRows(
    transactions
) {

    const rows = [];


    rows.push([

        "क्र.",

        "तारीख",

        "प्रकार",

        "नाव / प्रकार",

        "वाडी",

        "तपशील",

        "जमा",

        "खर्च",

        "Receipt / Reference",

        "Payment Mode"

    ]);


    sortReportTransactions(
        transactions
    )
    .forEach(
        function(
            item,
            index
        ) {

            rows.push([

                index + 1,

                reportFormatDate(
                    item.date
                ),

                item.type,

                item.name,

                item.wadi,

                item.description,

                item.income || 0,

                item.expense || 0,

                item.reference,

                item.paymentMode

            ]);

        }
    );


    return rows;

}


/* =========================================================
   30. CSV EXPORT
========================================================= */

function exportReportCSV() {

    const transactions =
        filteredTransactions.length
            ? filteredTransactions
            : buildAllTransactions();


    const rows =
        getCSVRows(
            transactions
        );


    const csv =
        "\uFEFF" +

        rows
            .map(
                function(row) {

                    return row
                        .map(
                            csvValue
                        )
                        .join(",");

                }
            )
            .join("\r\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    downloadReportFile(
        blob,
        "MGVM_Report.csv"
    );

}


/* =========================================================
   31. EXCEL EXPORT
========================================================= */

function exportReportExcel() {

    const transactions =
        filteredTransactions.length
            ? filteredTransactions
            : buildAllTransactions();


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Excel library उपलब्ध नाही. CSV Export केला जाईल."
        );

        exportReportCSV();

        return;

    }


    /* =====================================================
       SHEET 1 - जमा
    ===================================================== */

    const incomeData =
        transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "income" ||
                    item.source ===
                    "donation"
                );

            }
        )
        .map(
            function(
                item,
                index
            ) {

                return {

                    "क्र.":
                        index + 1,

                    "तारीख":
                        reportFormatDate(
                            item.date
                        ),

                    "प्रकार":
                        item.type,

                    "नाव / प्रकार":
                        item.name,

                    "वाडी":
                        item.wadi,

                    "तपशील":
                        item.description,

                    "जमा":
                        Number(
                            item.income || 0
                        ),

                    "Receipt / Reference":
                        item.reference,

                    "Payment Mode":
                        item.paymentMode

                };

            }
        );


    /* =====================================================
       SHEET 2 - वर्गणी
    ===================================================== */

    const subscriptionData =
        transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "subscription"
                );

            }
        )
        .map(
            function(
                item,
                index
            ) {

                return {

                    "क्र.":
                        index + 1,

                    "तारीख":
                        reportFormatDate(
                            item.date
                        ),

                    "वर्गणी वर्ष":
                        String(
                            item.description ||
                            ""
                        )
                        .replace(
                            "वर्गणी ",
                            ""
                        ),

                    "सभासदाचे नाव":
                        item.name,

                    "वाडी":
                        item.wadi,

                    "तपशील":
                        "वर्गणी",

                    "वर्गणी":
                        Number(
                            item.income || 0
                        ),

                    "Receipt / Reference":
                        item.reference,

                    "Payment Mode":
                        item.paymentMode

                };

            }
        );


    /* =====================================================
       SHEET 3 - खर्च
    ===================================================== */

    const expenseData =
        transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "expense"
                );

            }
        )
        .map(
            function(
                item,
                index
            ) {

                return {

                    "क्र.":
                        index + 1,

                    "तारीख":
                        reportFormatDate(
                            item.date
                        ),

                    "खर्च प्रकार":
                        item.name,

                    "नाव / प्रकार":
                        item.name,

                    "तपशील":
                        item.description,

                    "खर्च":
                        Number(
                            item.expense || 0
                        ),

                    "Payment Mode":
                        item.paymentMode,

                    "Receipt / Reference":
                        item.reference

                };

            }
        );


    /* =====================================================
       CREATE WORKBOOK
    ===================================================== */

    const workbook =
        XLSX.utils.book_new();


    /* =====================================================
       ADD जमा SHEET
    ===================================================== */

    const incomeSheet =
        XLSX.utils.json_to_sheet(
            incomeData
        );


    XLSX.utils.book_append_sheet(
        workbook,
        incomeSheet,
        "जमा Transactions"
    );


    /* =====================================================
       ADD वर्गणी SHEET
    ===================================================== */

    const subscriptionSheet =
        XLSX.utils.json_to_sheet(
            subscriptionData
        );


    XLSX.utils.book_append_sheet(
        workbook,
        subscriptionSheet,
        "वर्गणी Transactions"
    );


    /* =====================================================
       ADD खर्च SHEET
    ===================================================== */

    const expenseSheet =
        XLSX.utils.json_to_sheet(
            expenseData
        );


    XLSX.utils.book_append_sheet(
        workbook,
        expenseSheet,
        "खर्च Transactions"
    );


    /* =====================================================
       ADD SUMMARY SHEET
    ===================================================== */

    const totalIncome =
        transactions.reduce(
            function(
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.income || 0
                    )
                );

            },
            0
        );


    const totalExpense =
        transactions.reduce(
            function(
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.expense || 0
                    )
                );

            },
            0
        );


    const totalSubscription =
        transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "subscription"
                );

            }
        )
        .reduce(
            function(
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.income || 0
                    )
                );

            },
            0
        );


    const totalDonation =
        transactions
        .filter(
            function(item) {

                return (
                    item.source ===
                    "donation"
                );

            }
        )
        .reduce(
            function(
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.income || 0
                    )
                );

            },
            0
        );


    const summaryData = [

        {
            "अहवाल":
                "मोर्डे ग्राम विकास मंडळ, मुंबई"
        },

        {
            "अहवाल":
                "आर्थिक अहवाल"
        },

        {},

        {
            "अहवाल":
                "एकूण जमा",

            "रक्कम":
                totalIncome
        },

        {
            "अहवाल":
                "एकूण वर्गणी",

            "रक्कम":
                totalSubscription
        },

        {
            "अहवाल":
                "एकूण देणगी",

            "रक्कम":
                totalDonation
        },

        {
            "अहवाल":
                "एकूण खर्च",

            "रक्कम":
                totalExpense
        },

        {
            "अहवाल":
                "शिल्लक रक्कम",

            "रक्कम":
                totalIncome -
                totalExpense
        }

    ];


    const summarySheet =
        XLSX.utils.json_to_sheet(
            summaryData
        );


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
    );


    /* =====================================================
       SAVE EXCEL
    ===================================================== */

    XLSX.writeFile(
        workbook,
        "MGVM_Report.xlsx"
    );

}


/* =========================================================
   32. DOWNLOAD FILE
========================================================= */

function downloadReportFile(
    blob,
    fileName
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        fileName;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        function() {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


/* =========================================================
   33. DASHBOARD
========================================================= */

function goToDashboard() {

    window.location.href =
        "index.html";

}


/* =========================================================
   34. FILTER EVENTS
========================================================= */

[
    "reportFromDate",
    "reportToDate",
    "reportFinancialYear",
    "reportTransactionType"
]
.forEach(
    function(id) {

        const element =
            document.getElementById(id);


        if (!element) {

            return;

        }


        element.addEventListener(
            "change",
            applyReportFilter
        );

    }
);


/* =========================================================
   35. INITIALIZE
========================================================= */

function initializeReportsPage() {

    loadReportData();


    loadFinancialYears();


    filteredTransactions =
        buildAllTransactions();


    renderReport(
        filteredTransactions
    );

}


/* =========================================================
   36. DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeReportsPage
    );

}
else {

    initializeReportsPage();

}


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM reports.js loaded successfully."
);
