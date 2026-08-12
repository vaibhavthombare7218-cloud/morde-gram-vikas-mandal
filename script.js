/* =========================================================
   script.js
   MGVM DASHBOARD
   मोर्डे ग्राम विकास मंडळ, मुंबई

   IMPORTANT:
   This file ONLY READS existing LocalStorage data.
   Existing save/edit/delete logic is NOT changed.
========================================================= */


/* =========================================================
   DATABASE KEYS
========================================================= */

const MGVM_DASHBOARD_KEYS = {

    MEMBERS:
        "mgvm_members",

    SUBSCRIPTIONS:
        "mgvm_subscriptions",

    DONATIONS:
        "mgvm_donations",

    INCOME:
        "mgvm_income",

    EXPENSE:
        "mgvm_expense",

    MEETINGS:
        "mgvm_meetings"

};


/* =========================================================
   ANNUAL SUBSCRIPTION
========================================================= */

const DASHBOARD_ANNUAL_AMOUNT = 200;


/* =========================================================
   READ LOCAL STORAGE SAFELY
========================================================= */

function dashboardRead(key) {

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
            "Dashboard Read Error:",
            key,
            error
        );

        return [];

    }

}


/* =========================================================
   LOAD ALL DATA
========================================================= */

function loadDashboardData() {

    return {

        members:
            dashboardRead(
                MGVM_DASHBOARD_KEYS.MEMBERS
            ),

        subscriptions:
            dashboardRead(
                MGVM_DASHBOARD_KEYS.SUBSCRIPTIONS
            ),

        donations:
            dashboardRead(
                MGVM_DASHBOARD_KEYS.DONATIONS
            ),

        income:
            dashboardRead(
                MGVM_DASHBOARD_KEYS.INCOME
            ),

        expense:
            dashboardRead(
                MGVM_DASHBOARD_KEYS.EXPENSE
            ),

        meetings:
            dashboardRead(
                MGVM_DASHBOARD_KEYS.MEETINGS
            )

    };

}


/* =========================================================
   GLOBAL DATA
========================================================= */

let dashboardData =
    loadDashboardData();


/* =========================================================
   REFRESH
========================================================= */

function refreshDashboardData() {

    dashboardData =
        loadDashboardData();

}


/* =========================================================
   NUMBER
========================================================= */

function dashboardNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/[₹]/g, "")
                .trim()
        );


    return isNaN(number)
        ? 0
        : number;

}


/* =========================================================
   AMOUNT FORMAT
========================================================= */

function formatDashboardAmount(value) {

    return (
        "₹" +
        dashboardNumber(value)
            .toLocaleString("en-IN")
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeDashboardHTML(value) {

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
   DATE HELPERS
========================================================= */

function getDashboardTodayString() {

    const date =
        new Date();


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}


/* =========================================================
   DATE NORMALIZER
========================================================= */

function normalizeDashboardDate(value) {

    if (!value) {

        return "";

    }


    const text =
        String(value).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {

        return text;

    }


    const date =
        new Date(text);


    if (isNaN(date.getTime())) {

        return "";

    }


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}


/* =========================================================
   DATE FROM OBJECT
========================================================= */

function getItemDate(item) {

    return normalizeDashboardDate(

        item.paymentDate ||

        item.date ||

        item.transactionDate ||

        item.meetingDate ||

        item.createdAt ||

        ""

    );

}


/* =========================================================
   MEMBER ID
========================================================= */

function getMemberId(member) {

    return (

        member.id ||

        member.memberId ||

        member.memberID ||

        member.member_id ||

        ""

    );

}


/* =========================================================
   MEMBER NAME
========================================================= */

function getMemberName(member) {

    return (

        member.name ||

        member.memberName ||

        member.fullName ||

        ""

    );

}


/* =========================================================
   MEMBER WADI
========================================================= */

function getMemberWadi(member) {

    return (

        member.wadi ||

        member.Wadi ||

        member.village ||

        ""

    );

}


/* =========================================================
   MEMBER MOBILE
========================================================= */

function getMemberMobile(member) {

    return (

        member.mobile ||

        member.mobileNo ||

        member.phone ||

        member.contact ||

        ""

    );

}


/* =========================================================
   SUBSCRIPTION MEMBER ID
========================================================= */

function getSubscriptionMemberId(item) {

    return (

        item.memberId ||

        item.memberID ||

        item.member_id ||

        ""

    );

}


/* =========================================================
   SUBSCRIPTION AMOUNT
========================================================= */

function getSubscriptionAmount(item) {

    return dashboardNumber(

        item.paidAmount ??

        item.amount ??

        item.paymentAmount ??

        0

    );

}


/* =========================================================
   DONATION AMOUNT
========================================================= */

function getDonationAmount(item) {

    return dashboardNumber(

        item.amount ??

        item.paidAmount ??

        item.donationAmount ??

        0

    );

}


/* =========================================================
   GENERIC AMOUNT
========================================================= */

function getGenericAmount(item) {

    return dashboardNumber(

        item.amount ??

        item.paidAmount ??

        item.totalAmount ??

        item.value ??

        0

    );

}


/* =========================================================
   TOTAL MEMBERS
========================================================= */

function calculateTotalMembers() {

    return dashboardData.members.length;

}


/* =========================================================
   TOTAL SUBSCRIPTION
========================================================= */

function calculateTotalSubscription() {

    return dashboardData.subscriptions.reduce(

        function(total, item) {

            return (
                total +
                getSubscriptionAmount(item)
            );

        },

        0

    );

}


/* =========================================================
   TOTAL DONATION
========================================================= */

function calculateTotalDonation() {

    return dashboardData.donations.reduce(

        function(total, item) {

            return (
                total +
                getDonationAmount(item)
            );

        },

        0

    );

}


/* =========================================================
   TOTAL INCOME
========================================================= */

function calculateTotalIncome() {

    return dashboardData.income.reduce(

        function(total, item) {

            return (
                total +
                getGenericAmount(item)
            );

        },

        0

    );

}


/* =========================================================
   TOTAL EXPENSE
========================================================= */

function calculateTotalExpense() {

    return dashboardData.expense.reduce(

        function(total, item) {

            return (
                total +
                getGenericAmount(item)
            );

        },

        0

    );

}


/* =========================================================
   TOTAL COLLECTION
========================================================= */

function calculateTotalCollection() {

    return (

        calculateTotalSubscription() +

        calculateTotalDonation() +

        calculateTotalIncome()

    );

}


/* =========================================================
   BALANCE
========================================================= */

function calculateBalance() {

    return (

        calculateTotalCollection() -

        calculateTotalExpense()

    );

}


/* =========================================================
   UPDATE MAIN CARDS
========================================================= */

function updateMainCards() {

    const members =
        document.getElementById(
            "totalMembers"
        );


    const subscription =
        document.getElementById(
            "totalSubscription"
        );


    const donation =
        document.getElementById(
            "totalDonation"
        );


    const income =
        document.getElementById(
            "totalIncome"
        );


    const expense =
        document.getElementById(
            "totalExpense"
        );


    const collection =
        document.getElementById(
            "totalCollection"
        );


    const balance =
        document.getElementById(
            "balanceAmount"
        );


    if (members) {

        members.innerText =
            calculateTotalMembers();

    }


    if (subscription) {

        subscription.innerText =
            formatDashboardAmount(
                calculateTotalSubscription()
            );

    }


    if (donation) {

        donation.innerText =
            formatDashboardAmount(
                calculateTotalDonation()
            );

    }


    if (income) {

        income.innerText =
            formatDashboardAmount(
                calculateTotalIncome()
            );

    }


    if (expense) {

        expense.innerText =
            formatDashboardAmount(
                calculateTotalExpense()
            );

    }


    if (collection) {

        collection.innerText =
            formatDashboardAmount(
                calculateTotalCollection()
            );

    }


    if (balance) {

        balance.innerText =
            formatDashboardAmount(
                calculateBalance()
            );

    }

}


/* =========================================================
   MEMBER PAID AMOUNT
========================================================= */

function getMemberPaidAmount(memberId) {

    return dashboardData.subscriptions.reduce(

        function(total, item) {

            if (

                String(
                    getSubscriptionMemberId(item)
                ) ===

                String(memberId)

            ) {

                return (

                    total +
                    getSubscriptionAmount(item)

                );

            }


            return total;

        },

        0

    );

}


/* =========================================================
   GET MEMBER PENDING
========================================================= */

function getMemberPending(member) {

    /*
       सर्वात आधी existing
       subscriptionPending check.
       Excel import मधील बाकी सुरक्षित राहते.
    */

    const storedPending =
        dashboardNumber(
            member.subscriptionPending
        );


    /*
       जर member मध्ये pending उपलब्ध असेल
       तर तेच दाखवणे.
    */

    if (
        storedPending > 0
    ) {

        return storedPending;

    }


    /*
       Subscription records वरून
       pending calculate.
    */

    const memberId =
        getMemberId(member);


    const subscriptions =
        dashboardData.subscriptions.filter(

            function(item) {

                return (

                    String(
                        getSubscriptionMemberId(item)
                    ) ===

                    String(memberId)

                );

            }

        );


    /*
       Subscription records नसतील
       आणि pending 0 असेल तर 0.
    */

    if (!subscriptions.length) {

        return 0;

    }


    const years = [];


    subscriptions.forEach(

        function(item) {

            if (
                item.year &&
                !years.includes(
                    String(item.year)
                )
            ) {

                years.push(
                    String(item.year)
                );

            }

        }

    );


    let pending = 0;


    years.forEach(

        function(year) {

            const paid =
                subscriptions
                    .filter(

                        function(item) {

                            return (
                                String(
                                    item.year
                                ) ===
                                String(year)
                            );

                        }

                    )
                    .reduce(

                        function(total, item) {

                            return (
                                total +
                                getSubscriptionAmount(item)
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
   TOTAL PENDING
========================================================= */

function calculateTotalPending() {

    return dashboardData.members.reduce(

        function(total, member) {

            return (
                total +
                getMemberPending(member)
            );

        },

        0

    );

}


/* =========================================================
   UPDATE PENDING
========================================================= */

function updatePendingCard() {

    const element =
        document.getElementById(
            "pendingSubscription"
        );


    if (!element) return;


    element.innerText =
        formatDashboardAmount(
            calculateTotalPending()
        );

}


/* =========================================================
   TODAY SUBSCRIPTION
========================================================= */

function calculateTodaySubscription() {

    const today =
        getDashboardTodayString();


    return dashboardData.subscriptions.reduce(

        function(total, item) {

            if (
                getItemDate(item) === today
            ) {

                return (
                    total +
                    getSubscriptionAmount(item)
                );

            }


            return total;

        },

        0

    );

}


/* =========================================================
   TODAY DONATION
========================================================= */

function calculateTodayDonation() {

    const today =
        getDashboardTodayString();


    return dashboardData.donations.reduce(

        function(total, item) {

            if (
                getItemDate(item) === today
            ) {

                return (
                    total +
                    getDonationAmount(item)
                );

            }


            return total;

        },

        0

    );

}


/* =========================================================
   TODAY INCOME
========================================================= */

function calculateTodayIncome() {

    const today =
        getDashboardTodayString();


    return dashboardData.income.reduce(

        function(total, item) {

            if (
                getItemDate(item) === today
            ) {

                return (
                    total +
                    getGenericAmount(item)
                );

            }


            return total;

        },

        0

    );

}


/* =========================================================
   TODAY EXPENSE
========================================================= */

function calculateTodayExpense() {

    const today =
        getDashboardTodayString();


    return dashboardData.expense.reduce(

        function(total, item) {

            if (
                getItemDate(item) === today
            ) {

                return (
                    total +
                    getGenericAmount(item)
                );

            }


            return total;

        },

        0

    );

}


/* =========================================================
   TODAY SUMMARY
========================================================= */

function updateTodaySummary() {

    const subscription =
        calculateTodaySubscription();


    const donation =
        calculateTodayDonation();


    const income =
        calculateTodayIncome();


    const expense =
        calculateTodayExpense();


    const balance =
        subscription +
        donation +
        income -
        expense;


    const elements = {

        todaySubscription:
            subscription,

        todayDonation:
            donation,

        todayIncome:
            income,

        todayExpense:
            expense,

        todayBalance:
            balance

    };


    Object.keys(elements)
        .forEach(

            function(id) {

                const element =
                    document.getElementById(id);


                if (element) {

                    element.innerText =
                        formatDashboardAmount(
                            elements[id]
                        );

                }

            }

        );

}


/* =========================================================
   FINANCIAL YEAR
========================================================= */

function getCurrentFinancialYear() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        date.getMonth() + 1;


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
        (year - 1) +
        "-" +
        String(year).slice(-2)
    );

}


/* =========================================================
   YEAR SUBSCRIPTION
========================================================= */

function calculateYearSubscription() {

    const currentFY =
        getCurrentFinancialYear();


    return dashboardData.subscriptions.reduce(

        function(total, item) {

            if (
                String(item.year) ===
                String(currentFY)
            ) {

                return (
                    total +
                    getSubscriptionAmount(item)
                );

            }


            return total;

        },

        0

    );

}


/* =========================================================
   UPDATE YEAR
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
   MEMBER STATUS
========================================================= */

function updateMemberStatus() {

    let pendingCount = 0;

    let paidCount = 0;


    dashboardData.members.forEach(

        function(member) {

            if (
                getMemberPending(member) > 0
            ) {

                pendingCount++;

            }
            else {

                paidCount++;

            }

        }

    );


    const pending =
        document.getElementById(
            "pendingMembersCount"
        );


    const paid =
        document.getElementById(
            "paidMembersCount"
        );


    if (pending) {

        pending.innerText =
            pendingCount;

    }


    if (paid) {

        paid.innerText =
            paidCount;

    }

}


/* =========================================================
   SEARCH MEMBER
========================================================= */

function searchMember() {

    refreshDashboardData();


    const input =
        document.getElementById(
            "memberSearch"
        );


    const result =
        document.getElementById(
            "searchResult"
        );


    if (
        !input ||
        !result
    ) {

        return;

    }


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    result.innerHTML = "";


    if (!keyword) {

        return;

    }


    const members =
        dashboardData.members.filter(

            function(member) {

                const name =
                    getMemberName(member)
                        .toLowerCase();


                const id =
                    String(
                        getMemberId(member)
                    )
                    .toLowerCase();


                const mobile =
                    String(
                        getMemberMobile(member)
                    )
                    .toLowerCase();


                return (

                    name.includes(keyword) ||

                    id.includes(keyword) ||

                    mobile.includes(keyword)

                );

            }

        );


    if (!members.length) {

        result.innerHTML = `

            <div class="card">

                <p>
                    ❌ सभासद सापडला नाही.
                </p>

            </div>

        `;

        return;

    }


    members
        .slice(0, 10)
        .forEach(

            function(member) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "member-search-result";


                const pending =
                    getMemberPending(member);


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
                                getMemberName(member)
                            )}

                        </strong>

                        <br>

                        <small>

                            ID:
                            ${escapeDashboardHTML(
                                getMemberId(member)
                            )}

                        </small>

                        <br>

                        <small>

                            वाडी:
                            ${escapeDashboardHTML(
                                getMemberWadi(member)
                            )}

                        </small>

                        <br>

                        <small>

                            मोबाईल:
                            ${escapeDashboardHTML(
                                getMemberMobile(member)
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


                result.appendChild(div);

            }

        );

}


/* =========================================================
   WADI FILTER
========================================================= */

function filterWadi() {

    refreshDashboardData();


    const select =
        document.getElementById(
            "wadiFilter"
        );


    const container =
        document.getElementById(
            "wadiMembers"
        );


    if (
        !select ||
        !container
    ) {

        return;

    }


    const selected =
        select.value;


    let members =
        dashboardData.members;


    if (selected) {

        members =
            members.filter(

                function(member) {

                    return (

                        String(
                            getMemberWadi(member)
                        ) ===
                        String(selected)

                    );

                }

            );

    }


    container.innerHTML = "";


    if (!members.length) {

        container.innerHTML = `

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


    members.forEach(

        function(member) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeDashboardHTML(
                        getMemberId(member)
                    )}
                </td>

                <td>
                    ${escapeDashboardHTML(
                        getMemberName(member)
                    )}
                </td>

                <td>
                    ${escapeDashboardHTML(
                        getMemberMobile(member)
                    )}
                </td>

                <td>
                    <strong>
                        ${formatDashboardAmount(
                            getMemberPending(member)
                        )}
                    </strong>
                </td>

            `;


            tbody.appendChild(row);

        }

    );


    container.appendChild(table);

}


/* =========================================================
   WADI STATISTICS
========================================================= */

function displayWadiStatistics() {

    const container =
        document.getElementById(
            "wadiStatistics"
        );


    if (!container) {

        return;

    }


    const statistics = {};


    dashboardData.members.forEach(

        function(member) {

            const wadi =
                getMemberWadi(member) ||
                "वाडी उपलब्ध नाही";


            if (
                !statistics[wadi]
            ) {

                statistics[wadi] = {

                    members:
                        0,

                    pending:
                        0,

                    paid:
                        0

                };

            }


            statistics[wadi].members++;


            statistics[wadi].pending +=
                getMemberPending(member);


            statistics[wadi].paid +=
                getMemberPaidAmount(
                    getMemberId(member)
                );

        }

    );


    container.innerHTML = "";


    Object.keys(statistics)
        .sort()
        .forEach(

            function(wadi) {

                const data =
                    statistics[wadi];


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
                            wadi
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


                container.appendChild(card);

            }

        );

}


/* =========================================================
   PENDING TABLE
========================================================= */

function displayPendingTable() {

    const tbody =
        document.getElementById(
            "pendingTable"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    const pendingMembers =
        dashboardData.members
            .map(

                function(member) {

                    return {

                        member:
                            member,

                        pending:
                            getMemberPending(member)

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

        tbody.innerHTML = `

            <tr>

                <td colspan="3"
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
                        getMemberName(member)
                    )}
                </td>

                <td>
                    ${escapeDashboardHTML(
                        getMemberWadi(member)
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


            tbody.appendChild(row);

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


    if (!container) {

        return;

    }


    const activities = [];


    /* -----------------------------
       SUBSCRIPTIONS
    ----------------------------- */

    dashboardData.subscriptions.forEach(

        function(item) {

            activities.push({

                type:
                    "वर्गणी",

                title:
                    item.memberName ||
                    item.name ||
                    "सभासद",

                amount:
                    getSubscriptionAmount(item),

                date:
                    getItemDate(item),

                timestamp:
                    item.createdAt ||
                    item.paymentDate ||
                    item.date ||
                    ""

            });

        }

    );


    /* -----------------------------
       DONATIONS
    ----------------------------- */

    dashboardData.donations.forEach(

        function(item) {

            activities.push({

                type:
                    "देणगी",

                title:
                    item.donorName ||
                    item.name ||
                    item.donationName ||
                    "देणगीदार",

                amount:
                    getDonationAmount(item),

                date:
                    getItemDate(item),

                timestamp:
                    item.createdAt ||
                    item.date ||
                    ""

            });

        }

    );


    /* -----------------------------
       INCOME
    ----------------------------- */

    dashboardData.income.forEach(

        function(item) {

            activities.push({

                type:
                    "उत्पन्न",

                title:
                    item.title ||
                    item.incomeHead ||
                    item.category ||
                    item.description ||
                    "उत्पन्न",

                amount:
                    getGenericAmount(item),

                date:
                    getItemDate(item),

                timestamp:
                    item.createdAt ||
                    item.date ||
                    ""

            });

        }

    );


    /* -----------------------------
       EXPENSE
    ----------------------------- */

    dashboardData.expense.forEach(

        function(item) {

            activities.push({

                type:
                    "खर्च",

                title:
                    item.title ||
                    item.expenseHead ||
                    item.category ||
                    item.description ||
                    "खर्च",

                amount:
                    getGenericAmount(item),

                date:
                    getItemDate(item),

                timestamp:
                    item.createdAt ||
                    item.date ||
                    ""

            });

        }

    );


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


    container.innerHTML = "";


    if (!latest.length) {

        container.innerHTML = `

            <p>
                अद्याप कोणतीही नोंद उपलब्ध नाही.
            </p>

        `;

        return;

    }


    latest.forEach(

        function(activity) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "activity-item";


            let icon =
                "📝";


            if (
                activity.type ===
                "वर्गणी"
            ) {

                icon =
                    "💰";

            }
            else if (
                activity.type ===
                "देणगी"
            ) {

                icon =
                    "❤️";

            }
            else if (
                activity.type ===
                "उत्पन्न"
            ) {

                icon =
                    "📈";

            }
            else if (
                activity.type ===
                "खर्च"
            ) {

                icon =
                    "📉";

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


            container.appendChild(div);

        }

    );

}


/* =========================================================
   RECENT MEETINGS
========================================================= */

function displayRecentMeetings() {

    const container =
        document.getElementById(
            "recentMeetings"
        );


    if (!container) {

        return;

    }


    const meetings =
        [...dashboardData.meetings];


    meetings.sort(

        function(a, b) {

            return (
                new Date(
                    getItemDate(b)
                ) -
                new Date(
                    getItemDate(a)
                )
            );

        }

    );


    const latest =
        meetings.slice(
            0,
            5
        );


    container.innerHTML = "";


    if (!latest.length) {

        container.innerHTML = `

            <p>
                अद्याप कोणतीही सभा नोंद उपलब्ध नाही.
            </p>

        `;

        return;

    }


    latest.forEach(

        function(meeting) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "activity-item";


            const meetingName =

                meeting.name ||

                meeting.meetingName ||

                meeting.title ||

                "सभा";


            const meetingDate =
                getItemDate(meeting);


            const place =

                meeting.place ||

                meeting.location ||

                meeting.venue ||

                "";


            div.innerHTML = `

                <div>

                    <strong>
                        🤝
                        ${escapeDashboardHTML(
                            meetingName
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeDashboardHTML(
                            place
                        )}
                    </small>

                </div>


                <div>

                    <strong>
                        ${escapeDashboardHTML(
                            meetingDate
                        )}
                    </strong>

                </div>

            `;


            container.appendChild(div);

        }

    );

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


    const date =
        new Date();


    element.innerText =
        date.toLocaleDateString(

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
   COMPLETE DASHBOARD
========================================================= */

function refreshDashboardEverything() {

    refreshDashboardData();


    updateMainCards();


    updatePendingCard();


    updateTodaySummary();


    updateYearSubscription();


    updateMemberStatus();


    displayPendingTable();


    displayRecentActivity();


    displayRecentMeetings();


    displayWadiStatistics();


    filterWadi();


    displayDashboardDate();

}


/* =========================================================
   MEMBER SEARCH EVENT
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        const search =
            document.getElementById(
                "memberSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                searchMember
            );

        }


        const wadi =
            document.getElementById(
                "wadiFilter"
            );


        if (wadi) {

            wadi.addEventListener(
                "change",
                filterWadi
            );

        }


        refreshDashboardEverything();

    }

);


/* =========================================================
   AUTO REFRESH
========================================================= */

window.addEventListener(

    "storage",

    function(event) {

        const validKeys = [

            "mgvm_members",

            "mgvm_subscriptions",

            "mgvm_donations",

            "mgvm_income",

            "mgvm_expense",

            "mgvm_meetings"

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


/* =========================================================
   PERIODIC REFRESH
   Same browser मध्ये दुसऱ्या page वरून data save
   झाल्यास dashboard refresh करण्यासाठी.
========================================================= */

setInterval(

    function() {

        refreshDashboardEverything();

    },

    5000

);
