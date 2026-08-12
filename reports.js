/* =========================================================
   reports.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   COMPLETE FINANCIAL REPORT

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
   ✅ All Transactions
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

function reportGetStorage(
    key
) {

    try {

        const data =
            localStorage.getItem(
                key
            );


        if (!data) {

            return [];

        }


        const parsed =
            JSON.parse(
                data
            );


        return Array.isArray(
            parsed
        )
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

function reportNumber(
    value
) {

    const number =
        Number(
            value || 0
        );


    return number.toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   6. MONEY
========================================================= */

function reportMoney(
    value
) {

    return (
        "₹" +
        reportNumber(
            value
        )
    );

}


/* =========================================================
   7. ESCAPE HTML
========================================================= */

function reportEscape(
    value
) {

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

function reportFormatDate(
    date
) {

    if (!date) {

        return "-";

    }


    const value =
        String(
            date
        );


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

function reportFinancialYear(
    date
) {

    if (!date) {

        return "";

    }


    const parts =
        String(
            date
        ).split("-");


    if (
        parts.length !== 3
    ) {

        return "";

    }


    const year =
        Number(
            parts[0]
        );


    const month =
        Number(
            parts[1]
        );


    /*
       April to March
    */

    if (
        month >= 4
    ) {

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
   10. GET WADI
========================================================= */

function getMemberWadi(
    memberId
) {

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
                    item.category || "इतर जमा",

                wadi:
                    "",

                description:
                    item.description || "",

                income:
                    Number(
                        item.amount || 0
                    ),

                expense:
                    0,

                reference:
                    item.receiptNo || "",

                paymentMode:
                    item.paymentMode || "",

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
                    item.category || "",

                wadi:
                    "",

                description:
                    item.description || "",

                income:
                    0,

                expense:
                    Number(
                        item.amount || 0
                    ),

                reference:
                    item.referenceNo || "",

                paymentMode:
                    item.paymentMode || "",

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
                    item.memberName || "",

                wadi:
                    item.wadi ||
                    getMemberWadi(
                        item.memberId
                    ),

                description:
                    "वर्गणी " +
                    (
                        item.year || ""
                    ),

                income:
                    Number(
                        item.paidAmount || 0
                    ),

                expense:
                    0,

                reference:
                    item.receiptNo || "",

                paymentMode:
                    item.paymentMode || "",

                source:
                    "subscription"

            });

        }
    );


    /* =====================================================
       DONATION
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
                    item.donorName || "",

                wadi:
                    getMemberWadi(
                        item.memberId
                    ),

                description:
                    item.memberId
                        ? "सभासद देणगी"
                        : "Non-Member Donation",

                income:
                    Number(
                        item.amount || 0
                    ),

                expense:
                    0,

                reference:
                    item.receiptNo || "",

                paymentMode:
                    item.paymentMode || "",

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

                    years.add(
                        fy
                    );

                }

            }
        );


    select.innerHTML = `

        <option value="">
            सर्व Financial Year
        </option>

    `;


    Array.from(
        years
    )
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


                /* TYPE */

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

        fromDate.value =
            "";

    }


    if (toDate) {

        toDate.value =
            "";

    }


    if (financialYear) {

        financialYear.value =
            "";

    }


    if (type) {

        type.value =
            "all";

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


    renderAllTransactions(
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
       Other income =
       Income transactions excluding
       subscription and donation.
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
        document.getElementById(
            id
        );


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


    const map =
        {};


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

                    map[category] =
                        0;

                }


                map[category] +=
                    Number(
                        item.expense || 0
                    );

            }
        );


    const rows =
        Object.entries(
            map
        )
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        );


    tbody.innerHTML =
        "";


    let total = 0;


    rows.forEach(
        function(
            row,
            index
        ) {

            total +=
                row[1];


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
            reportMoney(
                total
            );

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


    const map =
        {};


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

                    map[wadi] =
                        0;

                }


                map[wadi] +=
                    Number(
                        item.income || 0
                    );

            }
        );


    const rows =
        Object.entries(
            map
        )
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        );


    tbody.innerHTML =
        "";


    let total = 0;


    rows.forEach(
        function(
            row,
            index
        ) {

            total +=
                row[1];


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
            reportMoney(
                total
            );

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


    const map =
        {};


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

                    map[wadi] =
                        0;

                }


                map[wadi] +=
                    Number(
                        item.income || 0
                    );

            }
        );


    const rows =
        Object.entries(
            map
        )
        .sort(
            function(a, b) {

                return b[1] - a[1];

            }
        );


    tbody.innerHTML =
        "";


    let total = 0;


    rows.forEach(
        function(
            row,
            index
        ) {

            total +=
                row[1];


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
            reportMoney(
                total
            );

    }

}


/* =========================================================
   21. ALL TRANSACTIONS
========================================================= */

function renderAllTransactions(
    transactions
) {

    const tbody =
        document.getElementById(
            "allTransactionsBody"
        );


    if (!tbody) {

        return;

    }


    const data =
        [...transactions]
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


    tbody.innerHTML =
        "";


    let totalIncome = 0;

    let totalExpense = 0;


    data.forEach(
        function(
            item,
            index
        ) {

            totalIncome +=
                Number(
                    item.income || 0
                );


            totalExpense +=
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
                            item.description || "-"
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
                        ${
                            item.expense > 0
                            ?
                            reportMoney(
                                item.expense
                            )
                            :
                            "-"
                        }
                    </td>

                    <td>
                        ${reportEscape(
                            item.reference || "-"
                        )}
                    </td>

                    <td>
                        ${reportEscape(
                            item.paymentMode || "-"
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
                    colspan="10"
                    class="empty-row"
                >

                    कोणतीही Transaction उपलब्ध नाही.

                </td>

            </tr>

        `;

    }


    const totalElement =
        document.getElementById(
            "allTransactionsTotal"
        );


    if (totalElement) {

        totalElement.innerHTML =

            "एकूण जमा: " +
            reportMoney(
                totalIncome
            ) +

            " &nbsp; | &nbsp; " +

            "एकूण खर्च: " +
            reportMoney(
                totalExpense
            ) +

            " &nbsp; | &nbsp; " +

            "शिल्लक: " +
            reportMoney(
                totalIncome -
                totalExpense
            );

    }

}


/* =========================================================
   22. REPORT PERIOD
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
        )?.value || "all";


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
   23. PRINT
========================================================= */

function printReport() {

    window.print();

}


/* =========================================================
   24. CSV ESCAPE
========================================================= */

function csvValue(
    value
) {

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
   25. CSV EXPORT
========================================================= */

function exportReportCSV() {

    const transactions =
        filteredTransactions.length
            ? filteredTransactions
            : buildAllTransactions();


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


    transactions
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
   26. EXCEL EXPORT
========================================================= */

function exportReportExcel() {

    /*
       जर SheetJS library उपलब्ध असेल
       तर proper .xlsx file तयार होईल.
    */

    const transactions =
        filteredTransactions.length
            ? filteredTransactions
            : buildAllTransactions();


    if (
        typeof XLSX !==
        "undefined"
    ) {

        const rows =
            transactions.map(
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

                        "खर्च":
                            Number(
                                item.expense || 0
                            ),

                        "Receipt / Reference":
                            item.reference,

                        "Payment Mode":
                            item.paymentMode

                    };

                }
            );


        const worksheet =
            XLSX.utils.json_to_sheet(
                rows
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "MGVM Report"
        );


        XLSX.writeFile(
            workbook,
            "MGVM_Report.xlsx"
        );


        return;

    }


    /*
       SheetJS नसेल तर CSV fallback.
    */

    alert(
        "Excel library उपलब्ध नाही. CSV Export केला जाईल."
    );


    exportReportCSV();

}


/* =========================================================
   27. DOWNLOAD FILE
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
   28. DASHBOARD
========================================================= */

function goToDashboard() {

    window.location.href =
        "index.html";

}


/* =========================================================
   29. FILTER EVENTS
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
            document.getElementById(
                id
            );


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
   30. INITIALIZE
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
   31. DOM READY
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
