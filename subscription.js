/* =========================================================
   subscription.js
   COMPLETE CORRECTED FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   Features:
   ✅ Member Search
   ✅ Member Select
   ✅ Member ID / Wadi Auto Fill
   ✅ Annual Subscription ₹200
   ✅ Historical / Opening Pending
   ✅ Current Year Payment
   ✅ Partial Payment
   ✅ Receipt Number
   ✅ Payment Mode
   ✅ Payment Date
   ✅ Save Subscription
   ✅ Update Member Pending
   ✅ Transaction List
   ✅ Year Filter
   ✅ Delete Transaction
   ✅ Dashboard Sync

   IMPORTANT LOGIC:

   Member:
   openingSubscriptionPending
       = Excel / historical pending

   Member:
   subscriptionPending
       = opening pending - all payments

   Subscription:
   प्रत्येक financial year maximum ₹200
   payment करता येईल.

   त्यामुळे उदाहरण:

   Excel Pending = ₹1500

   Payment = ₹200

   New Pending = ₹1300
========================================================= */


/* =========================================================
   1. GLOBAL DATA
========================================================= */

let members = [];

let subscriptions = [];

let selectedMember = null;

const DEFAULT_ANNUAL_AMOUNT = 200;


/* =========================================================
   2. LOAD DATA
========================================================= */

function loadSubscriptionData() {

    try {

        members =
            JSON.parse(
                localStorage.getItem(
                    "mgvm_members"
                )
            ) || [];

    }
    catch (error) {

        console.error(
            "Members Load Error:",
            error
        );

        members = [];

    }


    try {

        subscriptions =
            JSON.parse(
                localStorage.getItem(
                    "mgvm_subscriptions"
                )
            ) || [];

    }
    catch (error) {

        console.error(
            "Subscriptions Load Error:",
            error
        );

        subscriptions = [];

    }

}


/* =========================================================
   3. SAVE DATA
========================================================= */

function saveMembers() {

    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(
            members
        )
    );

}


function saveSubscriptions() {

    localStorage.setItem(
        "mgvm_subscriptions",
        JSON.stringify(
            subscriptions
        )
    );

}


/* =========================================================
   4. DOM ELEMENTS
========================================================= */

const subscriptionForm =
    document.getElementById(
        "subscriptionForm"
    );

const memberSearchInput =
    document.getElementById(
        "memberSearch"
    );

const memberSuggestions =
    document.getElementById(
        "memberSuggestions"
    );

const subscriptionMemberId =
    document.getElementById(
        "subscriptionMemberId"
    );

const subscriptionMemberName =
    document.getElementById(
        "subscriptionMemberName"
    );

const subscriptionWadi =
    document.getElementById(
        "subscriptionWadi"
    );

const subscriptionYear =
    document.getElementById(
        "subscriptionYear"
    );

const annualAmount =
    document.getElementById(
        "annualAmount"
    );

const paidAmount =
    document.getElementById(
        "paidAmount"
    );

const pendingAmount =
    document.getElementById(
        "pendingAmount"
    );

const receiptNo =
    document.getElementById(
        "receiptNo"
    );

const paymentMode =
    document.getElementById(
        "paymentMode"
    );

const paymentDate =
    document.getElementById(
        "paymentDate"
    );

const enteredBy =
    document.getElementById(
        "enteredBy"
    );


/* =========================================================
   5. CURRENT YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


/* =========================================================
   6. FINANCIAL YEAR
========================================================= */

function getFinancialYear(
    year
) {

    return (
        year +
        "-" +
        String(
            year + 1
        ).slice(-2)
    );

}


/* =========================================================
   7. YEAR OPTIONS
========================================================= */

function loadSubscriptionYears() {

    if (!subscriptionYear) return;


    subscriptionYear.innerHTML = `

        <option value="">
            वर्ष निवडा
        </option>

    `;


    for (
        let year = currentYear - 5;
        year <= currentYear + 2;
        year++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            getFinancialYear(
                year
            );


        option.textContent =
            getFinancialYear(
                year
            );


        subscriptionYear.appendChild(
            option
        );

    }

}


/* =========================================================
   8. TRANSACTION YEAR FILTER
========================================================= */

function loadTransactionYears() {

    const filter =
        document.getElementById(
            "transactionYearFilter"
        );


    if (!filter) return;


    filter.innerHTML = `

        <option value="">
            सर्व वर्षे
        </option>

    `;


    const years = [];


    subscriptions.forEach(
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


    years.sort();


    years.forEach(
        function(year) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;

            option.textContent =
                year;


            filter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   9. TODAY DATE
========================================================= */

function setTodayDate() {

    if (!paymentDate) return;


    const today =
        new Date();


    const yyyy =
        today.getFullYear();


    const mm =
        String(
            today.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const dd =
        String(
            today.getDate()
        )
        .padStart(
            2,
            "0"
        );


    paymentDate.value =
        `${yyyy}-${mm}-${dd}`;

}


/* =========================================================
   10. DEFAULT ANNUAL
========================================================= */

function setDefaultAnnualAmount() {

    if (
        annualAmount
    ) {

        annualAmount.value =
            DEFAULT_ANNUAL_AMOUNT;

    }

}


/* =========================================================
   11. ESCAPE HTML
========================================================= */

function escapeSubscriptionHTML(
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
   12. SEARCH MEMBERS
========================================================= */

function searchSubscriptionMembers() {

    loadSubscriptionData();


    if (
        !memberSearchInput ||
        !memberSuggestions
    ) {

        return;

    }


    const keyword =
        String(
            memberSearchInput.value || ""
        )
        .trim()
        .toLowerCase();


    memberSuggestions.innerHTML =
        "";


    if (!keyword) {

        memberSuggestions.style.display =
            "none";

        return;

    }


    const results =
        members.filter(
            function(member) {

                const name =
                    String(
                        member.name || ""
                    )
                    .trim()
                    .toLowerCase();


                const id =
                    String(
                        member.id || ""
                    )
                    .trim()
                    .toLowerCase();


                const mobile =
                    String(
                        member.mobile || ""
                    )
                    .trim()
                    .toLowerCase();


                const wadi =
                    String(
                        member.wadi || ""
                    )
                    .trim()
                    .toLowerCase();


                return (

                    name.includes(keyword) ||
                    id.includes(keyword) ||
                    mobile.includes(keyword) ||
                    wadi.includes(keyword)

                );

            }
        )
        .slice(
            0,
            15
        );


    if (!results.length) {

        memberSuggestions.innerHTML = `

            <div class="suggestion-item">

                <i class="fa fa-user-slash"></i>

                सभासद सापडला नाही.

            </div>

        `;

        memberSuggestions.style.display =
            "block";

        return;

    }


    results.forEach(
        function(member) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "suggestion-item";


            item.innerHTML = `

                <div>

                    <strong>

                        <i class="fa fa-user"></i>

                        ${escapeSubscriptionHTML(
                            member.name
                        )}

                    </strong>

                    <br>

                    <small>

                        ID:
                        ${escapeSubscriptionHTML(
                            member.id
                        )}

                        &nbsp; | &nbsp;

                        वाडी:
                        ${escapeSubscriptionHTML(
                            member.wadi
                        )}

                        &nbsp; | &nbsp;

                        मोबाईल:
                        ${escapeSubscriptionHTML(
                            member.mobile
                        )}

                    </small>

                </div>

            `;


            item.addEventListener(
                "click",
                function() {

                    selectSubscriptionMember(
                        member
                    );

                }
            );


            memberSuggestions.appendChild(
                item
            );

        }
    );


    memberSuggestions.style.display =
        "block";

}


if (
    memberSearchInput
) {

    memberSearchInput.addEventListener(
        "input",
        searchSubscriptionMembers
    );

}


/* =========================================================
   13. SELECT MEMBER
========================================================= */

function selectSubscriptionMember(
    member
) {

    loadSubscriptionData();


    selectedMember =
        members.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        member.id
                    )
                );

            }
        ) || member;


    if (
        subscriptionMemberId
    ) {

        subscriptionMemberId.value =
            selectedMember.id || "";

    }


    if (
        subscriptionMemberName
    ) {

        subscriptionMemberName.value =
            selectedMember.name || "";

    }


    if (
        subscriptionWadi
    ) {

        subscriptionWadi.value =
            selectedMember.wadi || "";

    }


    if (
        memberSearchInput
    ) {

        memberSearchInput.value =
            selectedMember.name || "";

    }


    if (
        memberSuggestions
    ) {

        memberSuggestions.innerHTML =
            "";

        memberSuggestions.style.display =
            "none";

    }


    updateMemberSubscriptionSummary();

    updatePendingAmount();

}


/* =========================================================
   14. FIND MEMBER
========================================================= */

function findMemberById(
    id
) {

    loadSubscriptionData();


    return (
        members.find(
            function(member) {

                return (
                    String(
                        member.id
                    ) ===
                    String(id)
                );

            }
        ) || null
    );

}


/* =========================================================
   15. GET YEAR PAYMENT
========================================================= */

function getMemberYearPayment(
    memberId,
    year
) {

    return subscriptions
        .filter(
            function(item) {

                return (

                    String(
                        item.memberId
                    ) ===
                    String(memberId) &&

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
                        item.paidAmount || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   16. GET MEMBER TOTAL PAID
========================================================= */

function getMemberTotalPaid(
    memberId
) {

    return subscriptions
        .filter(
            function(item) {

                return (
                    String(
                        item.memberId
                    ) ===
                    String(memberId)
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
                        item.paidAmount || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   17. ENSURE OPENING PENDING
========================================================= */

function ensureMemberPendingStructure(
    member
) {

    if (!member) return;


    if (
        member.openingSubscriptionPending ===
        undefined ||
        member.openingSubscriptionPending ===
        null
    ) {

        const totalPaid =
            getMemberTotalPaid(
                member.id
            );


        const currentPending =
            Number(
                member.subscriptionPending || 0
            );


        member.openingSubscriptionPending =
            Math.max(
                0,
                currentPending +
                totalPaid
            );

    }


    if (
        member.subscriptionPayments ===
        undefined
    ) {

        member.subscriptionPayments =
            [];

    }

}


/* =========================================================
   18. RECALCULATE MEMBER PENDING
========================================================= */

function recalculateMemberPending(
    memberId
) {

    loadSubscriptionData();


    const index =
        members.findIndex(
            function(member) {

                return (
                    String(
                        member.id
                    ) ===
                    String(memberId)
                );

            }
        );


    if (index === -1) {

        return 0;

    }


    const member =
        members[index];


    ensureMemberPendingStructure(
        member
    );


    const opening =
        Number(
            member.openingSubscriptionPending
        ) || 0;


    const totalPaid =
        getMemberTotalPaid(
            memberId
        );


    member.subscriptionPending =
        Math.max(
            0,
            opening -
            totalPaid
        );


    members[index] =
        member;


    saveMembers();


    return (
        member.subscriptionPending
    );

}


/* =========================================================
   19. CALCULATE FORM PENDING
========================================================= */

function calculatePendingAmount() {

    if (
        !selectedMember ||
        !subscriptionYear
    ) {

        return DEFAULT_ANNUAL_AMOUNT;

    }


    const year =
        subscriptionYear.value;


    if (!year) {

        return DEFAULT_ANNUAL_AMOUNT;

    }


    const alreadyPaid =
        getMemberYearPayment(
            selectedMember.id,
            year
        );


    const paidNow =
        Number(
            paidAmount
            ?
            paidAmount.value
            :
            0
        ) || 0;


    const annual =
        Number(
            annualAmount
            ?
            annualAmount.value
            :
            DEFAULT_ANNUAL_AMOUNT
        ) || DEFAULT_ANNUAL_AMOUNT;


    return Math.max(
        0,
        annual -
        alreadyPaid -
        paidNow
    );

}


/* =========================================================
   20. UPDATE FORM PENDING
========================================================= */

function updatePendingAmount() {

    if (
        !pendingAmount
    ) {

        return;

    }


    pendingAmount.value =
        calculatePendingAmount();

}


/* =========================================================
   21. MEMBER SUMMARY
========================================================= */

function updateMemberSubscriptionSummary() {

    if (
        !selectedMember
    ) {

        return;

    }


    const summary =
        document.getElementById(
            "memberSubscriptionSummary"
        );


    if (!summary) return;


    const year =
        subscriptionYear
        ?
        subscriptionYear.value
        :
        "";


    if (!year) {

        summary.innerHTML = "";

        return;

    }


    const alreadyPaid =
        getMemberYearPayment(
            selectedMember.id,
            year
        );


    const yearPending =
        Math.max(
            0,
            DEFAULT_ANNUAL_AMOUNT -
            alreadyPaid
        );


    const totalMemberPending =
        Number(
            selectedMember.subscriptionPending
        ) || 0;


    summary.innerHTML = `

        <div class="subscription-summary">

            <strong>
                ${escapeSubscriptionHTML(
                    selectedMember.name
                )}
            </strong>

            <div>
                वर्ष:
                ${escapeSubscriptionHTML(
                    year
                )}
            </div>

            <div>
                वार्षिक वर्गणी:
                ₹${DEFAULT_ANNUAL_AMOUNT}
            </div>

            <div>
                या वर्षी भरलेली:
                ₹${alreadyPaid}
            </div>

            <div>
                या वर्षाची बाकी:
                ₹${yearPending}
            </div>

            <div>
                एकूण बाकी:
                ₹${totalMemberPending}
            </div>

        </div>

    `;

}


/* =========================================================
   22. YEAR CHANGE
========================================================= */

if (
    subscriptionYear
) {

 
