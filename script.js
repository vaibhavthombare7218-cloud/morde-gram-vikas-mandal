/* =========================================================
   script.js - Part 1
   MGVM Dashboard
   मोर्डे ग्राम विकास मंडळ, मुंबई
========================================================= */


/* =========================================================
   DATABASE DATA
========================================================= */

let dashboardMembers =
    JSON.parse(
        localStorage.getItem(
            "mgvm_members"
        )
    ) || [];


let dashboardSubscriptions =
    JSON.parse(
        localStorage.getItem(
            "mgvm_subscriptions"
        )
    ) || [];


let dashboardDonations =
    JSON.parse(
        localStorage.getItem(
            "mgvm_donations"
        )
    ) || [];


let dashboardIncome =
    JSON.parse(
        localStorage.getItem(
            "mgvm_income"
        )
    ) || [];


let dashboardExpense =
    JSON.parse(
        localStorage.getItem(
            "mgvm_expense"
        )
    ) || [];


/* =========================================================
   ANNUAL SUBSCRIPTION
========================================================= */

const DASHBOARD_ANNUAL_AMOUNT = 200;


/* =========================================================
   CURRENCY FORMAT
========================================================= */

function formatDashboardAmount(amount) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   REFRESH DATABASE DATA
========================================================= */

function refreshDashboardData() {

    dashboardMembers =
        JSON.parse(
            localStorage.getItem(
                "mgvm_members"
            )
        ) || [];


    dashboardSubscriptions =
        JSON.parse(
            localStorage.getItem(
                "mgvm_subscriptions"
            )
        ) || [];


    dashboardDonations =
        JSON.parse(
            localStorage.getItem(
                "mgvm_donations"
            )
        ) || [];


    dashboardIncome =
        JSON.parse(
            localStorage.getItem(
                "mgvm_income"
            )
        ) || [];


    dashboardExpense =
        JSON.parse(
            localStorage.getItem(
                "mgvm_expense"
            )
        ) || [];

}


/* =========================================================
   TOTAL MEMBERS
========================================================= */

function updateTotalMembers() {

    const element =
        document.getElementById(
            "totalMembers"
        );


    if (!element) return;


    element.innerText =
        dashboardMembers.length;

}


/* =========================================================
   TOTAL SUBSCRIPTION
========================================================= */

function calculateTotalSubscription() {

    return dashboardSubscriptions.reduce(
        function(
            total,
            item
        ) {

            return (
                total +
                Number(
                    item.paidAmount || 0
                )
            );

        },
        0
    );

}


/* =========================================================
   TOTAL DONATION
========================================================= */

function calculateTotalDonation() {

    return dashboardDonations.reduce(
        function(
            total,
            item
        ) {

            return (
                total +
                Number(
                    item.amount || 0
                )
            );

        },
        0
    );

}


/* =========================================================
   TOTAL INCOME
========================================================= */

function calculateTotalIncome() {

    return dashboardIncome.reduce(
        function(
            total,
            item
        ) {

            return (
                total +
                Number(
                    item.amount || 0
                )
            );

        },
        0
    );

}


/* =========================================================
   TOTAL EXPENSE
========================================================= */

function calculateTotalExpense() {

    return dashboardExpense.reduce(
        function(
            total,
            item
        ) {

            return (
                total +
                Number(
                    item.amount || 0
                )
            );

        },
        0
    );

}


/* =========================================================
   UPDATE TOTAL SUBSCRIPTION
========================================================= */

function updateTotalSubscription() {

    const element =
        document.getElementById(
            "totalSubscription"
        );


    if (!element) return;


    const total =
        calculateTotalSubscription();


    element.innerText =
        formatDashboardAmount(
            total
        );

}


/* =========================================================
   UPDATE TOTAL DONATION
========================================================= */

function updateTotalDonation() {

    const element =
        document.getElementById(
            "totalDonation"
        );


    if (!element) return;


    const total =
        calculateTotalDonation();


    element.innerText =
        formatDashboardAmount(
            total
        );

}


/* =========================================================
   UPDATE TOTAL INCOME
========================================================= */

function updateTotalIncome() {

    const element =
        document.getElementById(
            "totalIncome"
        );


    if (!element) return;


    const total =
        calculateTotalIncome();


    element.innerText =
        formatDashboardAmount(
            total
        );

}


/* =========================================================
   UPDATE TOTAL EXPENSE
========================================================= */

function updateTotalExpense() {

    const element =
        document.getElementById(
            "totalExpense"
        );


    if (!element) return;


    const total =
        calculateTotalExpense();


    element.innerText =
        formatDashboardAmount(
            total
        );

}


/* =========================================================
   CALCULATE PENDING SUBSCRIPTION
========================================================= */

function calculateDashboardPending() {

    let totalPending = 0;


    /*
       प्रत्येक सदस्यासाठी
       त्याच्या भरलेल्या वर्षांची
       बाकी रक्कम calculate केली जाते.
    */


    dashboardMembers.forEach(
        function(member) {

            const memberSubscriptions =
                dashboardSubscriptions.filter(
                    function(item) {

                        return (
                            String(
                                item.memberId
                            ) ===
                            String(
                                member.id
                            )
                        );

                    }
                );


            const years = [];


            memberSubscriptions.forEach(
                function(item) {

                    if (
                        item.year &&
                        !years.includes(
                            item.year
                        )
                    ) {

                        years.push(
                            item.year
                        );

                    }

                }
            );


            years.forEach(
                function(year) {

                    const paid =
                        memberSubscriptions
                            .filter(
                                function(item) {

                                    return (
                                        item.year ===
                                        year
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
                                            item.paidAmount ||
                                            0
                                        )
                                    );

                                },
                                0
                            );


                    totalPending +=
                        Math.max(
                            0,
                            DASHBOARD_ANNUAL_AMOUNT -
                            paid
                        );

                }
            );

        }
    );


    return totalPending;

}


/* =========================================================
   UPDATE PENDING SUBSCRIPTION
========================================================= */

function updatePendingSubscription() {

    const element =
        document.getElementById(
            "pendingSubscription"
        );


    if (!element) return;


    const pending =
        calculateDashboardPending();


    element.innerText =
        formatDashboardAmount(
            pending
        );

}


/* =========================================================
   CALCULATE TODAY SUBSCRIPTION
========================================================= */

function calculateTodaySubscription() {

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


    const todayString =
        `${yyyy}-${mm}-${dd}`;


    return dashboardSubscriptions.reduce(
        function(
            total,
            item
        ) {

            if (
                item.paymentDate ===
                todayString
            ) {

                return (
                    total +
                    Number(
                        item.paidAmount || 0
                    )
                );

            }


            return total;

        },
        0
    );

}


/* =========================================================
   UPDATE TODAY SUBSCRIPTION
========================================================= */

function updateTodaySubscription() {

    const element =
        document.getElementById(
            "todaySubscription"
        );


    if (!element) return;


    element.innerText =
        formatDashboardAmount(
            calculateTodaySubscription()
        );

}


/* =========================================================
   CURRENT FINANCIAL YEAR
========================================================= */

function getCurrentFinancialYear() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        today.getMonth() + 1;


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
        (year - 1) +
        "-" +
        String(year).slice(-2)
    );

}


/* =========================================================
   THIS YEAR SUBSCRIPTION
========================================================= */

function calculateYearSubscription() {

    const currentFY =
        getCurrentFinancialYear();


    return dashboardSubscriptions.reduce(
        function(
            total,
            item
        ) {

            if (
                item.year ===
                currentFY
            ) {

                return (
                    total +
                    Number(
                        item.paidAmount || 0
                    )
                );

            }


            return total;

        },
        0
    );

}


/* =========================================================
   UPDATE YEAR SUBSCRIPTION
========================================================= */

function updateYearSubscription() {

    const element =
        document.getElementById(
            "yearSubscription"
        );


    if (!element) return;


    element.innerText =
        formatDashboardAmount(
            calculateYearSubscription()
        );

}


/* =========================================================
   BALANCE
========================================================= */

function calculateBalance() {

    const subscription =
        calculateTotalSubscription();


    const donation =
        calculateTotalDonation();


    const income =
        calculateTotalIncome();


    const expense =
        calculateTotalExpense();


    return (
        subscription +
        donation +
        income -
        expense
    );

}


/* =========================================================
   UPDATE BALANCE
========================================================= */

function updateBalance() {

    const element =
        document.getElementById(
            "balanceAmount"
        );


    if (!element) return;


    element.innerText =
        formatDashboardAmount(
            calculateBalance()
        );

}


/* =========================================================
   UPDATE COMPLETE DASHBOARD
========================================================= */

function updateDashboard() {

    refreshDashboardData();


    updateTotalMembers();

    updateTotalSubscription();

    updatePendingSubscription();

    updateTotalDonation();

    updateTodaySubscription();

    updateYearSubscription();

    updateTotalIncome();

    updateTotalExpense();

    updateBalance();

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboard();

    }
);


/* =========================================================
   AUTO REFRESH
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
                "mgvm_members" ||

            event.key ===
                "mgvm_subscriptions" ||

            event.key ===
                "mgvm_donations" ||

            event.key ===
                "mgvm_income" ||

            event.key ===
                "mgvm_expense"
        ) {

            updateDashboard();

        }

    }
);

/* =========================================================
   script.js - Part 2
   Member Search + Wadi Search
   Pending Subscription + Recent Activity
========================================================= */


/* =========================================================
   MEMBER SEARCH
========================================================= */

const dashboardMemberSearch =
    document.getElementById(
        "memberSearch"
    );


const dashboardSearchResult =
    document.getElementById(
        "searchResult"
    );


/* =========================================================
   SEARCH MEMBER
========================================================= */

function searchMember() {

    refreshDashboardData();


    if (!dashboardMemberSearch) {
        return;
    }


    const keyword =
        dashboardMemberSearch.value
            .trim()
            .toLowerCase();


    if (
        !dashboardSearchResult
    ) {
        return;
    }


    dashboardSearchResult.innerHTML =
        "";


    if (!keyword) {

        return;

    }


    const results =
        dashboardMembers.filter(
            function(member) {

                const name =
                    String(
                        member.name || ""
                    ).toLowerCase();


                const id =
                    String(
                        member.id || ""
                    ).toLowerCase();


                const mobile =
                    String(
                        member.mobile || ""
                    ).toLowerCase();


                return (
                    name.includes(
                        keyword
                    ) ||

                    id.includes(
                        keyword
                    ) ||

                    mobile.includes(
                        keyword
                    )
                );

            }
        );


    if (!results.length) {

        dashboardSearchResult.innerHTML = `

            <div class="card">

                <p>
                    ❌ सभासद सापडला नाही.
                </p>

            </div>

        `;

        return;

    }


    results
        .slice(0, 10)
        .forEach(
            function(member) {

                const pending =
                    getMemberDashboardPending(
                        member.id
                    );


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "member-search-result";


                div.innerHTML = `

                    <div>

                        ${
                            member.photo
                            ?
                            `
                            <img
                                src="${member.photo}"
                                style="
                                    width:60px;
                                    height:60px;
                                    object-fit:cover;
                                    border-radius:50%;
                                "
                            >
                            `
                            :
                            `
                            <div
                                style="
                                    width:60px;
                                    height:60px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                    font-size:24px;
                                "
                            >
                                👤
                            </div>
                            `
                        }

                    </div>


                    <div>

                        <strong>
                            ${escapeDashboardHTML(
                                member.name
                            )}
                        </strong>

                        <br>

                        <small>
                            ID:
                            ${escapeDashboardHTML(
                                member.id
                            )}
                        </small>

                        <br>

                        <small>
                            वाडी:
                            ${escapeDashboardHTML(
                                member.wadi
                            )}
                        </small>

                        <br>

                        <small>
                            मोबाईल:
                            ${escapeDashboardHTML(
                                member.mobile
                            )}
                        </small>

                        <br>

                        <strong>
                            बाकी:
                            ${formatDashboardAmount(
                                pending
                            )}
                        </strong>

                    </div>

                `;


                dashboardSearchResult.appendChild(
                    div
                );

            }
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeDashboardHTML(
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
   GET MEMBER PENDING
========================================================= */

function getMemberDashboardPending(
    memberId
) {

    const member =
        dashboardMembers.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        memberId
                    )
                );

            }
        );


    if (
        member &&
        Number(
            member.subscriptionPending
        ) > 0
    ) {

        return Number(
            member.subscriptionPending
        );

    }


    const memberSubscriptions =
        dashboardSubscriptions.filter(
            function(item) {

                return (
                    String(
                        item.memberId
                    ) ===
                    String(
                        memberId
                    )
                );

            }
        );


    const years = [];


    memberSubscriptions.forEach(
        function(item) {

            if (
                item.year &&
                !years.includes(
                    item.year
                )
            ) {

                years.push(
                    item.year
                );

            }

        }
    );


    let pending = 0;


    years.forEach(
        function(year) {

            const paid =
                memberSubscriptions
                    .filter(
                        function(item) {

                            return (
                                item.year ===
                                year
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
                                    item.paidAmount ||
                                    0
                                )
                            );

                        },
                        0
                    );


            pending +=
                Math.max(
                    0,
                    DASHBOARD_ANNUAL_AMOUNT -
                    paid
                );

        }
    );


    return pending;

}


/* =========================================================
   WADI FILTER
========================================================= */

const dashboardWadiFilter =
    document.getElementById(
        "wadiFilter"
    );


const dashboardWadiMembers =
    document.getElementById(
        "wadiMembers"
    );


/* =========================================================
   FILTER WADI
========================================================= */

function filterWadi() {

    refreshDashboardData();


    if (
        !dashboardWadiFilter ||
        !dashboardWadiMembers
    ) {

        return;

    }


    const selectedWadi =
        dashboardWadiFilter.value;


    dashboardWadiMembers.innerHTML =
        "";


    let filteredMembers =
        dashboardMembers;


    if (selectedWadi) {

        filteredMembers =
            dashboardMembers.filter(
                function(member) {

                    return (
                        String(
                            member.wadi || ""
                        ) ===
                        String(
                            selectedWadi
                        )
                    );

                }
            );

    }


    if (!filteredMembers.length) {

        dashboardWadiMembers.innerHTML = `

            <div class="card">

                <p>
                    या वाडीमध्ये सभासद उपलब्ध नाहीत.
                </p>

            </div>

        `;

        return;

    }


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "table";


    table.innerHTML = `

        <thead>

            <tr>

                <th>
                    Member ID
                </th>

                <th>
                    सभासद
                </th>

                <th>
                    मोबाईल
                </th>

                <th>
                    बाकी
                </th>

            </tr>

        </thead>


        <tbody></tbody>

    `;


    const tbody =
        table.querySelector(
            "tbody"
        );


    filteredMembers.forEach(
        function(member) {

            const pending =
                getMemberDashboardPending(
                    member.id
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeDashboardHTML(
                        member.id
                    )}
                </td>

                <td>
                    ${escapeDashboardHTML(
                        member.name
                    )}
                </td>

                <td>
                    ${escapeDashboardHTML(
                        member.mobile
                    )}
                </td>

                <td>
                    ${formatDashboardAmount(
                        pending
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    dashboardWadiMembers.appendChild(
        table
    );

}


/* =========================================================
   PENDING SUBSCRIPTION TABLE
========================================================= */

function displayDashboardPendingTable() {

    const tableBody =
        document.getElementById(
            "pendingTable"
        );


    if (!tableBody) return;


    tableBody.innerHTML =
        "";


    refreshDashboardData();


    const pendingMembers =
        dashboardMembers
            .map(
                function(member) {

                    return {

                        member:
                            member,

                        pending:
                            getMemberDashboardPending(
                                member.id
                            )

                    };

                }
            )
            .filter(
                function(item) {

                    return (
                        item.pending > 0
                    );

                }
            )
            .sort(
                function(a, b) {

                    return (
                        b.pending -
                        a.pending
                    );

                }
            );


    if (!pendingMembers.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    align="center">

                    🎉 कोणतीही बाकी वर्गणी नाही.

                </td>

            </tr>

        `;

        return;

    }


    pendingMembers.forEach(
        function(item) {

            const member =
                item.member;


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeDashboardHTML(
                        member.name
                    )}
                </td>

                <td>
                    ${escapeDashboardHTML(
                        member.wadi
                    )}
                </td>

                <td>

                    <strong>

                        ${formatDashboardAmount(
                            item.pending
                        )}

                    </strong>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function displayRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );


    if (!container) return;


    refreshDashboardData();


    const activities = [];


    /* -----------------------------
       Subscription
    ----------------------------- */

    dashboardSubscriptions.forEach(
        function(item) {

            activities.push({

                type:
                    "वर्गणी",

                title:
                    item.memberName ||
                    "सभासद",

                amount:
                    Number(
                        item.paidAmount ||
                        0
                    ),

                date:
                    item.paymentDate ||
                    "",

                timestamp:
                    item.createdAt ||
                    item.paymentDate ||
                    ""

            });

        }
    );


    /* -----------------------------
       Donation
    ----------------------------- */

    dashboardDonations.forEach(
        function(item) {

            activities.push({

                type:
                    "देणगी",

                title:
                    item.name ||
                    item.donorName ||
                    "देणगीदार",

                amount:
                    Number(
                        item.amount ||
                        0
                    ),

                date:
                    item.date ||
                    "",

                timestamp:
                    item.createdAt ||
                    item.date ||
                    ""

            });

        }
    );


    /* -----------------------------
       Income
    ----------------------------- */

    dashboardIncome.forEach(
        function(item) {

            activities.push({

                type:
                    "उत्पन्न",

                title:
                    item.title ||
                    item.description ||
                    "उत्पन्न",

                amount:
                    Number(
                        item.amount ||
                        0
                    ),

                date:
                    item.date ||
                    "",

                timestamp:
                    item.createdAt ||
                    item.date ||
                    ""

            });

        }
    );


    /* -----------------------------
       Expense
    ----------------------------- */

    dashboardExpense.forEach(
        function(item) {

            activities.push({

                type:
                    "खर्च",

                title:
                    item.title ||
                    item.description ||
                    "खर्च",

                amount:
                    Number(
                        item.amount ||
                        0
                    ),

                date:
                    item.date ||
                    "",

                timestamp:
                    item.createdAt ||
                    item.date ||
                    ""

            });

        }
    );


    /* -----------------------------
       Sort Latest First
    ----------------------------- */

    activities.sort(
        function(a, b) {

            return (
                new Date(
                    b.timestamp
                ) -
                new Date(
                    a.timestamp
                )
            );

        }
    );


    const latest =
        activities.slice(
            0,
            10
        );


    if (!latest.length) {

        container.innerHTML = `

            <p>
                अद्याप कोणतीही नोंद उपलब्ध नाही.
            </p>

        `;

        return;

    }


    container.innerHTML =
        "";


    latest.forEach(
        function(activity) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "activity-item";


            let icon = "📝";


            if (
                activity.type ===
                "वर्गणी"
            ) {

                icon = "💰";

            }
            else if (
                activity.type ===
                "देणगी"
            ) {

                icon = "❤️";

            }
            else if (
                activity.type ===
                "उत्पन्न"
            ) {

                icon = "📈";

            }
            else if (
                activity.type ===
                "खर्च"
            ) {

                icon = "📉";

            }


            div.innerHTML = `

                <div>

                    <strong>

                        ${icon}
                        ${escapeDashboardHTML(
                            activity.type
                        )}

                    </strong>

                    <br>

                    <span>

                        ${escapeDashboardHTML(
                            activity.title
                        )}

                    </span>

                </div>


                <div>

                    <strong>

                        ${formatDashboardAmount(
                            activity.amount
                        )}

                    </strong>

                    <br>

                    <small>

                        ${escapeDashboardHTML(
                            activity.date
                        )}

                    </small>

                </div>

            `;


            container.appendChild(
                div
            );

        }
    );

}


/* =========================================================
   INITIAL DASHBOARD LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayDash
/* =========================================================
   script.js - Part 3
   Wadi Statistics + Today's Activity + Dashboard Helpers
========================================================= */


/* =========================================================
   WADI-WISE STATISTICS
========================================================= */

function calculateWadiStatistics() {

    refreshDashboardData();


    const statistics = {};


    dashboardMembers.forEach(
        function(member) {

            const wadiName =
                member.wadi ||
                "वाडी उपलब्ध नाही";


            if (
                !statistics[wadiName]
            ) {

                statistics[wadiName] = {

                    members: 0,

                    pending: 0,

                    paid: 0

                };

            }


            statistics[wadiName].members++;


            statistics[wadiName].pending +=
                getMemberDashboardPending(
                    member.id
                );


            const paid =
                dashboardSubscriptions
                    .filter(
                        function(item) {

                            return (
                                String(
                                    item.memberId
                                ) ===
                                String(
                                    member.id
                                )
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
                                    item.paidAmount ||
                                    0
                                )
                            );

                        },
                        0
                    );


            statistics[wadiName].paid +=
                paid;

        }
    );


    return statistics;

}


/* =========================================================
   SHOW WADI STATISTICS
========================================================= */

function displayWadiStatistics() {

    const container =
        document.getElementById(
            "wadiStatistics"
        );


    /*
       जर index.html मध्ये
       wadiStatistics नसतील तर
       function काही करणार नाही.
    */

    if (!container) {

        return;

    }


    const statistics =
        calculateWadiStatistics();


    container.innerHTML =
        "";


    const wadiNames =
        Object.keys(
            statistics
        );


    if (!wadiNames.length) {

        container.innerHTML = `

            <p>
                अद्याप वाडी नुसार डेटा उपलब्ध नाही.
            </p>

        `;

        return;

    }


    wadiNames.sort();


    wadiNames.forEach(
        function(wadiName) {

            const data =
                statistics[wadiName];


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "stat-card";


            card.innerHTML = `

                <h3>
                    🏡
                    ${escapeDashboardHTML(
                        wadiName
                    )}
                </h3>


                <p>
                    सभासद:
                    <strong>
                        ${data.members}
                    </strong>
                </p>


                <p>
                    जमा वर्गणी:
                    <strong>
                        ${formatDashboardAmount(
                            data.paid
                        )}
                    </strong>
                </p>


                <p>
                    बाकी:
                    <strong>
                        ${formatDashboardAmount(
                            data.pending
                        )}
                    </strong>
                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   TODAY DATE
========================================================= */

function getDashboardTodayString() {

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


    return (
        yyyy +
        "-" +
        mm +
        "-" +
        dd
    );

}


/* =========================================================
   TODAY'S TOTAL COLLECTION
========================================================= */

function calculateTodayCollection() {

    refreshDashboardData();


    const today =
        getDashboardTodayString();


    let total = 0;


    dashboardSubscriptions.forEach(
        function(item) {

            if (
                item.paymentDate ===
                today
            ) {

                total +=
                    Number(
                        item.paidAmount ||
                        0
                    );

            }

        }
    );


    dashboardDonations.forEach(
        function(item) {

            if (
                item.date ===
                today
            ) {

                total +=
                    Number(
                        item.amount ||
                        0
                    );

            }

        }
    );


    dashboardIncome.forEach(
        function(item) {

            if (
                item.date ===
                today
            ) {

                total +=
                    Number(
                        item.amount ||
                        0
                    );

            }

        }
    );


    return total;

}


/* =========================================================
   TODAY'S EXPENSE
========================================================= */

function calculateTodayExpense() {

    refreshDashboardData();


    const today =
        getDashboardTodayString();


    return dashboardExpense.reduce(
        function(
            total,
            item
        ) {

            if (
                item.date ===
                today
            ) {

                return (
                    total +
                    Number(
                        item.amount ||
                        0
                    )
                );

            }


            return total;

        },
        0
    );

}


/* =========================================================
   TODAY'S BALANCE
========================================================= */

function calculateTodayBalance() {

    return (
        calculateTodayCollection() -
        calculateTodayExpense()
    );

}


/* =========================================================
   SHOW TODAY SUMMARY
========================================================= */

function displayTodaySummary() {

    const collectionElement =
        document.getElementById(
            "todayCollection"
        );


    const expenseElement =
        document.getElementById(
            "todayExpense"
        );


    const balanceElement =
        document.getElementById(
            "todayBalance"
        );


    if (
        collectionElement
    ) {

        collectionElement.innerText =
            formatDashboardAmount(
                calculateTodayCollection()
            );

    }


    if (
        expenseElement
    ) {

        expenseElement.innerText =
            formatDashboardAmount(
                calculateTodayExpense()
            );

    }


    if (
        balanceElement
    ) {

        balanceElement.innerText =
            formatDashboardAmount(
                calculateTodayBalance()
            );

    }

}


/* =========================================================
   MEMBER COUNT BY WADI
========================================================= */

function getMemberCountByWadi(
    wadiName
) {

    refreshDashboardData();


    return dashboardMembers.filter(
        function(member) {

            return (
                String(
                    member.wadi || ""
                ) ===
                String(
                    wadiName || ""
                )
            );

        }
    ).length;

}


/* =========================================================
   TOTAL PENDING MEMBER COUNT
========================================================= */

function getPendingMemberCount() {

    refreshDashboardData();


    return dashboardMembers.filter(
        function(member) {

            return (
                getMemberDashboardPending(
                    member.id
                ) > 0
            );

        }
    ).length;

}


/* =========================================================
   TOTAL PAID MEMBER COUNT
========================================================= */

function getPaidMemberCount() {

    refreshDashboardData();


    return dashboardMembers.filter(
        function(member) {

            return (
                getMemberDashboardPending(
                    member.id
                ) <= 0
            );

        }
    ).length;

}


/* =========================================================
   DASHBOARD EXTRA COUNTERS
========================================================= */

function updateExtraDashboardCounters() {

    const pendingMembers =
        document.getElementById(
            "pendingMembersCount"
        );


    const paidMembers =
        document.getElementById(
            "paidMembersCount"
        );


    if (
        pendingMembers
    ) {

        pendingMembers.innerText =
            getPendingMemberCount();

    }


    if (
        paidMembers
    ) {

        paidMembers.innerText =
            getPaidMemberCount();

    }

}


/* =========================================================
   EXPORT DASHBOARD DATA
========================================================= */

function getDashboardBackupData() {

    refreshDashboardData();


    return {

        exportedAt:
            new Date().toISOString(),

        members:
            dashboardMembers,

        subscriptions:
            dashboardSubscriptions,

        donations:
            dashboardDonations,

        income:
            dashboardIncome,

        expense:
            dashboardExpense

    };

}


/* =========================================================
   DOWNLOAD BACKUP
========================================================= */

function downloadDashboardBackup() {

    const data =
        getDashboardBackupData();


    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


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
        "MGVM_Backup_" +
        getDashboardTodayString() +
        ".json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   PRINT DASHBOARD
========================================================= */

function printDashboard() {

    window.print();

}


/* =========================================================
   DASHBOARD DATE
========================================================= */

function displayDashboardDate() {

    const element =
        document.getElementById(
            "dashboardDate"
        );


    if (!element) {

        return;

    }


    const today =
        new Date();


    element.innerText =
        today.toLocaleDateString(
            "mr-IN",
            {
                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"
            }
        );

}


/* =========================================================
   FINAL DASHBOARD REFRESH
========================================================= */

function refreshDashboardEverything() {

    refreshDashboardData();


    updateDashboard();


    displayDashboardPendingTable();


    displayRecentActivity();


    filterWadi();


    displayWadiStatistics();


    displayTodaySummary();


    updateExtraDashboardCounters();


    displayDashboardDate();

}


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        refreshDashboardEverything();

    }
);


/* =========================================================
   STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        const validKeys = [

            "mgvm_members",

            "mgvm_subscriptions",

            "mgvm_donations",

            "mgvm_income",

            "mgvm_expense"

        ];


        if (
            validKeys.includes(
                event.key
            )
        ) {

            refreshDashboardEverything();

        }

    }
);
