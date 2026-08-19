/* =========================================================
   subscription.js
   COMPLETE FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   FEATURES:
   ✅ mgvm_members compatible
   ✅ mgvm_subscriptions compatible
   ✅ Excel imported subscriptionPending supported
   ✅ Existing pending preserved
   ✅ Annual subscription amount from Settings supported
   ✅ Partial payment supported
   ✅ Member pending reduced after payment
   ✅ Delete payment restores pending
   ✅ Member summary cards
   ✅ Year-wise subscription status
   ✅ All transaction display
   ✅ Search transaction
   ✅ Year filter
   ✅ Receipt number auto generation
   ✅ Dashboard sync
========================================================= */


/* =========================================================
   1. GLOBAL DATA
========================================================= */

let members = [];

let subscriptions = [];

let selectedMember = null;


/* =========================================================
   2. ANNUAL SUBSCRIPTION AMOUNT
========================================================= */

function getAnnualSubscriptionAmount() {

    const amount =
        Number(
            localStorage.getItem(
                "mgvm_annual_subscription_amount"
            )
        );

    if (
        Number.isFinite(amount) &&
        amount >= 0
    ) {

        return amount;

    }

    return 200;

}


const DEFAULT_ANNUAL_AMOUNT =
    getAnnualSubscriptionAmount();


/* =========================================================
   3. LOAD LOCAL STORAGE
========================================================= */

function loadSubscriptionData() {

    /* MEMBERS */

    try {

        const storedMembers =
            localStorage.getItem(
                "mgvm_members"
            );

        const parsedMembers =
            storedMembers
                ? JSON.parse(storedMembers)
                : [];

        members =
            Array.isArray(parsedMembers)
                ? parsedMembers
                : [];

    }
    catch (error) {

        console.error(
            "Members Load Error:",
            error
        );

        members = [];

    }


    /* SUBSCRIPTIONS */

    try {

        const storedSubscriptions =
            localStorage.getItem(
                "mgvm_subscriptions"
            );

        const parsedSubscriptions =
            storedSubscriptions
                ? JSON.parse(
                    storedSubscriptions
                )
                : [];

        subscriptions =
            Array.isArray(
                parsedSubscriptions
            )
                ? parsedSubscriptions
                : [];

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
   4. SAVE MEMBERS
========================================================= */

function saveMembers() {

    try {

        localStorage.setItem(
            "mgvm_members",
            JSON.stringify(
                members
            )
        );

        return true;

    }
    catch (error) {

        console.error(
            "Save Members Error:",
            error
        );

        alert(
            "सभासद data save करताना समस्या आली."
        );

        return false;

    }

}


/* =========================================================
   5. SAVE SUBSCRIPTIONS
========================================================= */

function saveSubscriptions() {

    try {

        localStorage.setItem(
            "mgvm_subscriptions",
            JSON.stringify(
                subscriptions
            )
        );

        return true;

    }
    catch (error) {

        console.error(
            "Save Subscriptions Error:",
            error
        );

        alert(
            "वर्गणी data save करताना समस्या आली."
        );

        return false;

    }

}


/* =========================================================
   6. DOM ELEMENTS
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
   7. CURRENT YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


/* =========================================================
   8. FINANCIAL YEAR
========================================================= */

function getFinancialYear(year) {

    return (
        year +
        "-" +
        String(
            year + 1
        ).slice(-2)
    );

}


/* =========================================================
   9. LOAD SUBSCRIPTION YEARS
========================================================= */

function loadSubscriptionYears() {

    if (!subscriptionYear) {

        return;

    }


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
   10. LOAD TRANSACTION YEARS
========================================================= */

function loadTransactionYears() {

    const filter =
        document.getElementById(
            "transactionYearFilter"
        );


    if (!filter) {

        return;

    }


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


    years.sort().reverse();


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
   11. TODAY DATE
========================================================= */

function setTodayDate() {

    if (!paymentDate) {

        return;

    }


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
        yyyy +
        "-" +
        mm +
        "-" +
        dd;

}


/* =========================================================
   12. DEFAULT ANNUAL AMOUNT
========================================================= */

function setDefaultAnnualAmount() {

    if (annualAmount) {

        annualAmount.value =
            getAnnualSubscriptionAmount();

    }

}


/* =========================================================
   13. HTML ESCAPE
========================================================= */

function escapeSubscriptionHTML(
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
   14. JS ESCAPE
========================================================= */

function escapeSubscriptionJS(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /"/g,
        '\\"'
    )
    .replace(
        /\r?\n/g,
        "\\n"
    );

}


/* =========================================================
   15. FIND MEMBER BY ID
========================================================= */

function findMemberById(id) {

    return (
        members.find(
            function(member) {

                return (
                    String(
                        member.id
                    ) ===
                    String(
                        id
                    )
                );

            }
        ) ||
        null
    );

}


/* =========================================================
   16. GET IMPORTED MEMBER PENDING
========================================================= */

function getImportedMemberPending(
    member
) {

    if (!member) {

        return 0;

    }


    const pending =
        Number(
            member.subscriptionPending
        );


    if (
        Number.isFinite(
            pending
        ) &&
        pending >= 0
    ) {

        return pending;

    }


    return 0;

}


/* =========================================================
   17. GET MEMBER PAYMENTS
========================================================= */

function getMemberPayments(
    memberId
) {

    return subscriptions.filter(
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

}


/* =========================================================
   18. GET MEMBER YEAR PAYMENT
========================================================= */

function getMemberYearPayment(
    memberId,
    year
) {

    return getMemberPayments(
        memberId
    )
    .filter(
        function(item) {

            return (
                String(
                    item.year
                ) ===
                String(
                    year
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
                    item.paidAmount || 0
                )
            );

        },
        0
    );

}


/* =========================================================
   19. CHECK YEAR PAYMENT
========================================================= */

function hasMemberYearPayment(
    memberId,
    year
) {

    return (
        getMemberYearPayment(
            memberId,
            year
        ) > 0
    );

}


/* =========================================================
   20. CALCULATE CURRENT PENDING
========================================================= */

function calculateCurrentPending() {

    if (!selectedMember) {

        return 0;

    }


    loadSubscriptionData();


    const latestMember =
        findMemberById(
            selectedMember.id
        );


    if (latestMember) {

        selectedMember =
            latestMember;

    }


    return Math.max(
        0,
        getImportedMemberPending(
            selectedMember
        )
    );

}


/* =========================================================
   21. MEMBER SEARCH
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
        members
        .filter(
            function(member) {

                const name =
                    String(
                        member.name || ""
                    )
                    .toLowerCase();


                const id =
                    String(
                        member.id || ""
                    )
                    .toLowerCase();


                const mobile =
                    String(
                        member.mobile || ""
                    )
                    .toLowerCase();


                const wadi =
                    String(
                        member.wadi || ""
                    )
                    .toLowerCase();


                return (

                    name.includes(
                        keyword
                    ) ||

                    id.includes(
                        keyword
                    ) ||

                    mobile.includes(
                        keyword
                    ) ||

                    wadi.includes(
                        keyword
                    )

                );

            }
        )
        .slice(
            0,
            15
        );


    if (
        results.length === 0
    ) {

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
   22. SELECT MEMBER
========================================================= */

function selectSubscriptionMember(
    member
) {

    loadSubscriptionData();


    const latestMember =
        findMemberById(
            member.id
        );


    selectedMember =
        latestMember ||
        member;


    if (subscriptionMemberId) {

        subscriptionMemberId.value =
            selectedMember.id || "";

    }


    if (subscriptionMemberName) {

        subscriptionMemberName.value =
            selectedMember.name || "";

    }


    if (subscriptionWadi) {

        subscriptionWadi.value =
            selectedMember.wadi || "";

    }


    if (memberSearchInput) {

        memberSearchInput.value =
            selectedMember.name || "";

    }


    if (memberSuggestions) {

        memberSuggestions.innerHTML =
            "";

        memberSuggestions.style.display =
            "none";

    }


    updateSubscriptionYearStatus();

    refreshMemberSubscriptionDisplay();

    updatePendingAmount();

}


/* =========================================================
   23. UPDATE YEAR STATUS
========================================================= */

function updateSubscriptionYearStatus() {

    if (
        !selectedMember ||
        !subscriptionYear
    ) {

        return;

    }


    const year =
        subscriptionYear.value;


    const info =
        document.getElementById(
            "subscriptionYearStatus"
        );


    if (!info || !year) {

        return;

    }


    const paid =
        getMemberYearPayment(
            selectedMember.id,
            year
        );


    const annual =
        getAnnualSubscriptionAmount();


    const pending =
        Math.max(
            0,
            annual - paid
        );


    if (paid >= annual) {

        info.innerHTML = `

            <span style="color:green;font-weight:700;">

                ✅ ${escapeSubscriptionHTML(year)}
                या वर्षाची वर्गणी पूर्ण भरलेली आहे.

            </span>

        `;

    }
    else if (paid > 0) {

        info.innerHTML = `

            <span style="color:#d97706;font-weight:700;">

                🟡 ${escapeSubscriptionHTML(year)}
                अंशतः भरलेली आहे.
                बाकी ₹${pending}

            </span>

        `;

    }
    else {

        info.innerHTML = `

            <span>

                ℹ️ ${escapeSubscriptionHTML(year)}
                या वर्षाची वार्षिक वर्गणी:
                ₹${annual}

            </span>

        `;

    }

}


/* =========================================================
   24. UPDATE PENDING AMOUNT
========================================================= */

function updatePendingAmount() {

    if (!pendingAmount) {

        return;

    }


    if (!selectedMember) {

        pendingAmount.value =
            0;

        return;

    }


    const currentPending =
        calculateCurrentPending();


    const amount =
        Number(
            paidAmount
                ? paidAmount.value
                : 0
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        pendingAmount.value =
            currentPending;

        return;

    }


    pendingAmount.value =
        Math.max(
            0,
            currentPending - amount
        );

}


/* =========================================================
   25. MEMBER SUMMARY
========================================================= */

function updateMemberSubscriptionSummary() {

    if (!selectedMember) {

        return;

    }


    const summary =
        document.getElementById(
            "memberSubscriptionSummary"
        );


    if (!summary) {

        return;

    }


    const currentPending =
        calculateCurrentPending();


    const year =
        subscriptionYear
            ? subscriptionYear.value
            : "";


    const yearPaid =
        year
            ? getMemberYearPayment(
                selectedMember.id,
                year
            )
            : 0;


    summary.innerHTML = `

        <div class="subscription-summary">

            <strong>
                ${escapeSubscriptionHTML(
                    selectedMember.name
                )}
            </strong>

            ${
                year
                ?
                `
                <div>
                    वर्ष:
                    ${escapeSubscriptionHTML(
                        year
                    )}
                </div>

                <div>
                    वार्षिक वर्गणी:
                    ₹${getAnnualSubscriptionAmount()}
                </div>

                <div>
                    या वर्षी भरलेली:
                    ₹${yearPaid}
                </div>
                `
                :
                ""
            }

            <div>
                सध्याची एकूण बाकी:
                <strong>
                    ₹${currentPending}
                </strong>
            </div>

        </div>

    `;

}


/* =========================================================
   26. MEMBER SUMMARY CARDS
========================================================= */

function updateMemberSummaryCards() {

    const annualEl =
        document.getElementById(
            "summaryAnnualAmount"
        );

    const paidEl =
        document.getElementById(
            "summaryPaidAmount"
        );

    const pendingEl =
        document.getElementById(
            "summaryPendingAmount"
        );

    const countEl =
        document.getElementById(
            "summaryTransactionCount"
        );


    if (!selectedMember) {

        if (annualEl)
            annualEl.innerText = "₹0";

        if (paidEl)
            paidEl.innerText = "₹0";

        if (pendingEl)
            pendingEl.innerText = "₹0";

        if (countEl)
            countEl.innerText = "0";

        return;

    }


    loadSubscriptionData();


    const memberTransactions =
        getMemberPayments(
            selectedMember.id
        );


    const totalPaid =
        memberTransactions.reduce(
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


    const currentPending =
        calculateCurrentPending();


    /*
       Unique paid years
    */

    const uniqueYears = [];


    memberTransactions.forEach(
        function(item) {

            if (
                item.year &&
                !uniqueYears.includes(
                    item.year
                )
            ) {

                uniqueYears.push(
                    item.year
                );

            }

        }
    );


    let annualTotal =
        uniqueYears.length *
        getAnnualSubscriptionAmount();


    /*
       Imported pending without transactions
    */

    const importedPending =
        getImportedMemberPending(
            selectedMember
        );


    if (
        memberTransactions.length === 0
    ) {

        if (importedPending > 0) {

            annualTotal =
                getAnnualSubscriptionAmount();

        }
        else {

            annualTotal = 0;

        }

    }


    /*
       जर चालू वर्षासाठी transaction नसेल
       आणि current pending 0 असेल,
       तर चालू वर्षाची annual liability दाखवा.
    */

    if (
        memberTransactions.length > 0 &&
        !uniqueYears.includes(
            getFinancialYear(currentYear)
        ) &&
        currentPending === 0
    ) {

        annualTotal +=
            getAnnualSubscriptionAmount();

    }


    if (annualEl) {

        annualEl.innerText =
            "₹" +
            annualTotal.toLocaleString(
                "en-IN"
            );

    }


    if (paidEl) {

        paidEl.innerText =
            "₹" +
            totalPaid.toLocaleString(
                "en-IN"
            );

    }


    if (pendingEl) {

        pendingEl.innerText =
            "₹" +
            currentPending.toLocaleString(
                "en-IN"
            );

    }


    if (countEl) {

        countEl.innerText =
            memberTransactions.length;

    }

}


/* =========================================================
   27. YEAR-WISE SUBSCRIPTION TABLE
========================================================= */

function displayMemberYearSubscription() {

    const body =
        document.getElementById(
            "yearSubscriptionBody"
        );


    if (!body) {

        return;

    }


    if (!selectedMember) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;">

                    सभासद निवडल्यानंतर
                    वर्षनिहाय माहिती येथे दिसेल.

                </td>

            </tr>

        `;

        return;

    }


    loadSubscriptionData();


    const memberId =
        selectedMember.id;


    const years = [];


    /*
       मागील 5 वर्षे
       + चालू वर्ष
    */

    for (
        let year = currentYear - 5;
        year <= currentYear;
        year++
    ) {

        years.push(
            getFinancialYear(
                year
            )
        );

    }


    /*
       Existing transaction years
    */

    subscriptions
        .filter(
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
        )
        .forEach(
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


    years.sort().reverse();


    body.innerHTML = "";


    years.forEach(
        function(year) {

            const paid =
                getMemberYearPayment(
                    memberId,
                    year
                );


            const annual =
                getAnnualSubscriptionAmount();


            const pending =
                Math.max(
                    0,
                    annual - paid
                );


            let status;


            if (
                paid >= annual
            ) {

                status = `

                    <span
                        style="
                            color:green;
                            font-weight:700;
                        "
                    >

                        ✅ पूर्ण

                    </span>

                `;

            }
            else if (
                paid > 0
            ) {

                status = `

                    <span
                        style="
                            color:#d97706;
                            font-weight:700;
                        "
                    >

                        🟡 अंशतः भरले

                    </span>

                `;

            }
            else {

                status = `

                    <span
                        style="
                            color:red;
                            font-weight:700;
                        "
                    >

                        🔴 बाकी

                    </span>

                `;

            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeSubscriptionHTML(
                        year
                    )}

                </td>

                <td>

                    ₹${annual.toLocaleString(
                        "en-IN"
                    )}

                </td>

                <td>

                    ₹${paid.toLocaleString(
                        "en-IN"
                    )}

                </td>

                <td>

                    ₹${pending.toLocaleString(
                        "en-IN"
                    )}

                </td>

                <td>

                    ${status}

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   28. REFRESH MEMBER DISPLAY
========================================================= */

function refreshMemberSubscriptionDisplay() {

    updateMemberSubscriptionSummary();

    updatePendingAmount();

    updateMemberSummaryCards();

    displayMemberYearSubscription();

}


/* =========================================================
   29. YEAR CHANGE
========================================================= */

if (
    subscriptionYear
) {

    subscriptionYear.addEventListener(
        "change",
        function() {

            updateSubscriptionYearStatus();

            refreshMemberSubscriptionDisplay();

        }
    );

}


/* =========================================================
   30. PAYMENT INPUT CHANGE
========================================================= */

if (
    paidAmount
) {

    paidAmount.addEventListener(
        "input",
        function() {

            updatePendingAmount();

        }
    );

}


/* =========================================================
   31. GENERATE RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

    loadSubscriptionData();


    let maxNumber = 0;


    subscriptions.forEach(
        function(item) {

            const receipt =
                String(
                    item.receiptNo || ""
                );


            const match =
                receipt.match(
                    /MGVM-REC-(\d+)/i
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
        "MGVM-REC-" +
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
   32. REDUCE MEMBER PENDING
========================================================= */

function reduceMemberPending(
    memberId,
    amount
) {

    const index =
        members.findIndex(
            function(member) {

                return (
                    String(
                        member.id
                    ) ===
                    String(
                        memberId
                    )
                );

            }
        );


    if (
        index === -1
    ) {

        return false;

    }


    const currentPending =
        Number(
            members[index]
                .subscriptionPending
        ) || 0;


    members[index]
        .subscriptionPending =
        Math.max(
            0,
            currentPending -
            Number(
                amount || 0
            )
        );


    saveMembers();


    selectedMember =
        members[index];


    return true;

}


/* =========================================================
   33. RESTORE MEMBER PENDING
========================================================= */

function increaseMemberPending(
    memberId,
    amount
) {

    const index =
        members.findIndex(
            function(member) {

                return (
                    String(
                        member.id
                    ) ===
                    String(
                        memberId
                    )
                );

            }
        );


    if (
        index === -1
    ) {

        return false;

    }


    const currentPending =
        Number(
            members[index]
                .subscriptionPending
        ) || 0;


    members[index]
        .subscriptionPending =
        currentPending +
        Number(
            amount || 0
        );


    saveMembers();


    return true;

}


/* =========================================================
   34. FORM SUBMIT
========================================================= */

if (
    subscriptionForm
) {

    subscriptionForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            loadSubscriptionData();


            /*
               MEMBER
            */

            if (!selectedMember) {

                if (
                    subscriptionMemberId &&
                    subscriptionMemberId.value
                ) {

                    selectedMember =
                        findMemberById(
                            subscriptionMemberId.value
                        );

                }

            }


            if (!selectedMember) {

                alert(
                    "कृपया प्रथम सभासद निवडा."
                );

                return;

            }


            const latestMember =
                findMemberById(
                    selectedMember.id
                );


            if (latestMember) {

                selectedMember =
                    latestMember;

            }


            /*
               YEAR
            */

            const year =
                subscriptionYear
                    ? subscriptionYear.value
                    : "";


            if (!year) {

                alert(
                    "कृपया वर्गणी वर्ष निवडा."
                );

                return;

            }


            /*
               PAYMENT MODE
            */

            if (
                paymentMode &&
                !paymentMode.value
            ) {

                alert(
                    "कृपया पेमेंट पद्धत निवडा."
                );

                return;

            }


            /*
               PAYMENT DATE
            */

            if (
                paymentDate &&
                !paymentDate.value
            ) {

                alert(
                    "कृपया पेमेंट तारीख निवडा."
                );

                return;

            }


            /*
               PAYMENT AMOUNT
            */

            const amount =
                Number(
                    paidAmount
                        ? paidAmount.value
                        : 0
                );


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                alert(
                    "कृपया योग्य वर्गणी रक्कम टाका."
                );

                return;

            }


            /*
               CURRENT PENDING
            */

            const currentPending =
                calculateCurrentPending();


            const yearAlreadyPaid =
                hasMemberYearPayment(
                    selectedMember.id,
                    year
                );


            /*
               Maximum payment
            */

            let maximumAllowed =
                currentPending;


            /*
               Pending 0 असल्यास
               नवीन वर्षासाठी annual amount.
            */

            if (
                currentPending === 0 &&
                !yearAlreadyPaid
            ) {

                maximumAllowed =
                    getAnnualSubscriptionAmount();

            }


            /*
               Existing year partial payment
            */

            if (
                yearAlreadyPaid &&
                currentPending === 0
            ) {

                maximumAllowed =
                    0;

            }


            if (
                amount >
                maximumAllowed
            ) {

                alert(
                    "या payment साठी कमाल रक्कम ₹" +
                    maximumAllowed +
                    " आहे."
                );

                return;

            }


            /*
               RECEIPT
            */

            let finalReceiptNo =
                receiptNo
                    ? receiptNo.value.trim()
                    : "";


            if (!finalReceiptNo) {

                finalReceiptNo =
                    generateReceiptNumber();

            }


            /*
               DUPLICATE RECEIPT
            */

            const receiptExists =
                subscriptions.some(
                    function(item) {

                        return (
                            String(
                                item.receiptNo || ""
                            )
                            .toLowerCase()
                            ===
                            String(
                                finalReceiptNo
                            )
                            .toLowerCase()
                        );

                    }
                );


            if (receiptExists) {

                alert(
                    "हा Receipt Number आधीपासून वापरलेला आहे."
                );

                return;

            }


            /*
               NEW PENDING
            */

            let newPending;


            if (
                currentPending > 0
            ) {

                newPending =
                    Math.max(
                        0,
                        currentPending -
                        amount
                    );

            }
            else {

                newPending =
                    Math.max(
                        0,
                        getAnnualSubscriptionAmount() -
                        amount
                    );

            }


            /*
               TRANSACTION
            */

            const transaction = {

                id:
                    "SUB-" +
                    Date.now(),

                memberId:
                    selectedMember.id,

                memberName:
                    selectedMember.name,

                wadi:
                    selectedMember.wadi ||
                    "",

                year:
                    year,

                annualAmount:
                    getAnnualSubscriptionAmount(),

                paidAmount:
                    amount,

                pendingAmount:
                    newPending,

                receiptNo:
                    finalReceiptNo,

                paymentMode:
                    paymentMode
                        ? paymentMode.value
                        : "",

                paymentDate:
                    paymentDate
                        ? paymentDate.value
                        : "",

                enteredBy:
                    enteredBy
                        ? enteredBy.value.trim()
                        : "",

                createdAt:
                    new Date().toISOString()

            };


            /*
               SAVE TRANSACTION
            */

            subscriptions.push(
                transaction
            );


            if (
                !saveSubscriptions()
            ) {

                subscriptions.pop();

                return;

            }


            /*
               UPDATE MEMBER PENDING
            */

            if (
                currentPending > 0
            ) {

                reduceMemberPending(
                    selectedMember.id,
                    amount
                );

            }
            else {

                const index =
                    members.findIndex(
                        function(member) {

                            return (
                                String(
                                    member.id
                                ) ===
                                String(
                                    selectedMember.id
                                )
                            );

                        }
                    );


                if (
                    index !== -1
                ) {

                    members[index]
                        .subscriptionPending =
                        newPending;


                    members[index]
                        .subscriptionPayments =
                        Array.isArray(
                            members[index]
                                .subscriptionPayments
                        )
                            ?
                            members[index]
                                .subscriptionPayments
                            :
                            [];


                    members[index]
                        .subscriptionPayments
                        .push(
                            transaction.id
                        );


                    saveMembers();


                    selectedMember =
                        members[index];

                }

            }


            /*
               SUCCESS
            */

            showSubscriptionToast(
                "वर्गणी यशस्वीरित्या जतन झाली."
            );


            loadSubscriptionData();

            loadTransactionYears();

            displaySubscriptionTransactions();

            updateSubscriptionDashboard();


            /*
               Form reset न करता
               selected member ची updated
               summary आधी दाखवा.
            */

            refreshMemberSubscriptionDisplay();


            /*
               Receipt preview
            */

            showReceiptPreview(
                transaction
            );


            resetSubscriptionForm();

        }
    );

}


/* =========================================================
   35. RESET FORM
========================================================= */

function resetSubscriptionForm() {

    selectedMember =
        null;


    if (
        subscriptionForm
    ) {

        subscriptionForm.reset();

    }


    if (
        memberSearchInput
    ) {

        memberSearchInput.value =
            "";

    }


    if (
        memberSuggestions
    ) {

        memberSuggestions.innerHTML =
            "";

        memberSuggestions.style.display =
            "none";

    }


    if (
        subscriptionMemberId
    ) {

        subscriptionMemberId.value =
            "";

    }


    if (
        subscriptionMemberName
    ) {

        subscriptionMemberName.value =
            "";

    }


    if (
        subscriptionWadi
    ) {

        subscriptionWadi.value =
            "";

    }


    setDefaultAnnualAmount();

    setTodayDate();


    if (
        pendingAmount
    ) {

        pendingAmount.value =
            "";

    }


    const summary =
        document.getElementById(
            "memberSubscriptionSummary"
        );


    if (summary) {

        summary.innerHTML =
            "";

    }


    const yearStatus =
        document.getElementById(
            "subscriptionYearStatus"
        );


    if (yearStatus) {

        yearStatus.innerHTML =
            "";

    }


    updateMemberSummaryCards();

    displayMemberYearSubscription();

}


/* =========================================================
   36. TOAST
========================================================= */

function showSubscriptionToast(
    message
) {

    const toast =
        document.getElementById(
            "subscriptionToast"
        ) ||
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
   37. DISPLAY TRANSACTIONS
========================================================= */

function displaySubscriptionTransactions(
    filterYear = "",
    searchText = ""
) {

    const tableBody =
        document.getElementById(
            "subscriptionTableBody"
        );


    if (!tableBody) {

        return;

    }


    loadSubscriptionData();


    let data =
        [...subscriptions];


    /*
       YEAR FILTER
    */

    if (filterYear) {

        data =
            data.filter(
                function(item) {

                    return (
                        String(
                            item.year || ""
                        ) ===
                        String(
                            filterYear
                        )
                    );

                }
            );

    }


    /*
       SEARCH
    */

    if (searchText) {

        const keyword =
            String(
                searchText
            )
            .trim()
            .toLowerCase();


        data =
            data.filter(
                function(item) {

                    return (

                        String(
                            item.memberName || ""
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
                            item.receiptNo || ""
                        )
                        .toLowerCase()
                        .includes(
                            keyword
                        )

                    );

                }
            );

    }


    /*
       Latest first
    */

    data.sort(
        function(a, b) {

            const dateA =
                String(
                    a.paymentDate ||
                    a.createdAt ||
                    ""
                );


            const dateB =
                String(
                    b.paymentDate ||
                    b.createdAt ||
                    ""
                );


            return dateB.localeCompare(
                dateA
            );

        }
    );


    /*
       NO DATA
    */

    if (
        data.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >

                    अद्याप कोणतीही
                    वर्गणी नोंद उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        "";


    /*
       CREATE ROW
    */

    data.forEach(
        function(item) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeSubscriptionHTML(
                        item.paymentDate ||
                        "-"
                    )}

                </td>

                <td>

                    ${escapeSubscriptionHTML(
                        item.memberId ||
                        "-"
                    )}

                </td>

                <td>

                    ${escapeSubscriptionHTML(
                        item.memberName ||
                        "-"
                    )}

                </td>

                <td>

                    ${escapeSubscriptionHTML(
                        item.year ||
                        "-"
                    )}

                </td>

                <td>

                    ₹${Number(
                        item.paidAmount || 0
                    ).toLocaleString(
                        "en-IN"
                    )}

                </td>

                <td>

                    ${escapeSubscriptionHTML(
                        item.paymentMode ||
                        "-"
                    )}

                </td>

                <td>

                    ${escapeSubscriptionHTML(
                        item.receiptNo ||
                        "-"
                    )}

                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteSubscription(
                            '${escapeSubscriptionJS(
                                item.id
                            )}'
                        )"
                    >

                        <i class="fa fa-trash"></i>

                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   38. TRANSACTION YEAR FILTER
========================================================= */

const transactionYearFilter =
    document.getElementById(
        "transactionYearFilter"
    );


if (
    transactionYearFilter
) {

    transactionYearFilter.addEventListener(
        "change",
        function() {

            const searchInput =
                document.getElementById(
                    "subscriptionSearch"
                );


            displaySubscriptionTransactions(
                this.value,
                searchInput
                    ? searchInput.value
                    : ""
            );

        }
    );

}


/* =========================================================
   39. TRANSACTION SEARCH
========================================================= */

const subscriptionSearch =
    document.getElementById(
        "subscriptionSearch"
    );


if (
    subscriptionSearch
) {

    subscriptionSearch.addEventListener(
        "input",
        function() {

            const yearFilter =
                document.getElementById(
                    "transactionYearFilter"
                );


            displaySubscriptionTransactions(
                yearFilter
                    ? yearFilter.value
                    : "",
                this.value
            );

        }
    );

}


/* =========================================================
   40. DELETE SUBSCRIPTION
========================================================= */

function deleteSubscription(
    transactionId
) {

    loadSubscriptionData();


    const transaction =
        subscriptions.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(
                        transactionId
                    )
                );

            }
        );


    if (!transaction) {

        alert(
            "नोंद सापडली नाही."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "ही वर्गणी नोंद Delete करायची आहे का?"
        );


    if (!confirmDelete) {

        return;

    }


    /*
       REMOVE TRANSACTION
    */

    subscriptions =
        subscriptions.filter(
            function(item) {

                return (
                    String(
                        item.id
                    ) !==
                    String(
                        transactionId
                    )
                );

            }
        );


    saveSubscriptions();


    /*
       RESTORE PENDING
    */

    increaseMemberPending(
        transaction.memberId,
        Number(
            transaction.paidAmount || 0
        )
    );


    loadSubscriptionData();


    loadTransactionYears();

    displaySubscriptionTransactions();

    updateSubscriptionDashboard();


    /*
       If deleted transaction belongs
       to selected member
    */

    if (
        selectedMember &&
        String(
            selectedMember.id
        ) ===
        String(
            transaction.memberId
        )
    ) {

        const latestMember =
            findMemberById(
                selectedMember.id
            );


        selectedMember =
            latestMember;


        refreshMemberSubscriptionDisplay();

    }


    showSubscriptionToast(
        "वर्गणी नोंद Delete झाली आणि बाकी पुन्हा update झाली."
    );

}


/* =========================================================
   41. DASHBOARD UPDATE
========================================================= */

function updateSubscriptionDashboard() {

    loadSubscriptionData();


    /*
       TOTAL SUBSCRIPTION
    */

    const totalSubscription =
        subscriptions.reduce(
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


    const element =
        document.getElementById(
            "totalSubscription"
        );


    if (element) {

        element.innerText =
            "₹" +
            totalSubscription.toLocaleString(
                "en-IN"
            );

    }


    /*
       CURRENT FINANCIAL YEAR
    */

    const currentFinancialYear =
        getFinancialYear(
            currentYear
        );


    const yearTotal =
        subscriptions
        .filter(
            function(item) {

                return (
                    String(
                        item.year
                    ) ===
                    String(
                        currentFinancialYear
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
                        item.paidAmount || 0
                    )
                );

            },
            0
        );


    const yearElement =
        document.getElementById(
            "yearSubscription"
        );


    if (yearElement) {

        yearElement.innerText =
            "₹" +
            yearTotal.toLocaleString(
                "en-IN"
            );

    }


    /*
       TODAY
    */

    const today =
        getLocalDateString();


    const todayTotal =
        subscriptions
        .filter(
            function(item) {

                return (
                    String(
                        item.paymentDate || ""
                    ) ===
                    today
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


    const todayElement =
        document.getElementById(
            "todaySubscription"
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
   42. LOCAL DATE
========================================================= */

function getLocalDateString() {

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


    return (
        yyyy +
        "-" +
        mm +
        "-" +
        dd
    );

}


/* =========================================================
   43. RECEIPT PREVIEW
========================================================= */

function showReceiptPreview(
    transaction
) {

    if (!transaction) {

        return;

    }


    const modal =
        document.getElementById(
            "receiptModal"
        );


    if (!modal) {

        return;

    }


    const setText =
        function(
            id,
            value
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value || "-";

            }

        };


    setText(
        "receiptPreviewNo",
        transaction.receiptNo
    );


    setText(
        "receiptPreviewMemberId",
        transaction.memberId
    );


    setText(
        "receiptPreviewName",
        transaction.memberName
    );


    setText(
        "receiptPreviewWadi",
        transaction.wadi
    );


    setText(
        "receiptPreviewYear",
        transaction.year
    );


    setText(
        "receiptPreviewAmount",
        Number(
            transaction.paidAmount || 0
        ).toLocaleString(
            "en-IN"
        )
    );


    setText(
        "receiptPreviewMode",
        transaction.paymentMode
    );


    setText(
        "receiptPreviewDate",
        transaction.paymentDate
    );


    modal.style.display =
        "block";

}


/* =========================================================
   44. CLOSE RECEIPT MODAL
========================================================= */

const closeReceiptModal =
    document.getElementById(
        "closeReceiptModal"
    );


if (
    closeReceiptModal
) {

    closeReceiptModal.addEventListener(
        "click",
        function() {

            const modal =
                document.getElementById(
                    "receiptModal"
                );


            if (modal) {

                modal.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   45. PRINT RECEIPT
========================================================= */

const printReceiptBtn =
    document.getElementById(
        "printReceiptBtn"
    );


if (
    printReceiptBtn
) {

    printReceiptBtn.addEventListener(
        "click",
        function() {

            const content =
                document.getElementById(
                    "receiptContent"
                );


            if (!content) {

                return;

            }


            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=700,height=700"
                );


            if (!printWindow) {

                alert(
                    "Print window उघडता आली नाही."
                );

                return;

            }


            printWindow.document.write(`

                <!DOCTYPE html>

                <html lang="mr">

                <head>

                    <meta charset="UTF-8">

                    <title>
                        वर्गणी पावती
                    </title>

                    <style>

                        body {
                            font-family:
                                Arial,
                                sans-serif;

                            padding:30px;
                        }

                        .receipt {
                            max-width:600px;
                            margin:auto;
                            border:2px solid #000;
                            padding:25px;
                        }

                        hr {
                            border:0;
                            border-top:
                                1px solid #000;
                        }

                    </style>

                </head>

                <body>

                    <div class="receipt">

                        ${content.innerHTML}

                    </div>

                </body>

                </html>

            `);


            printWindow.document.close();

            printWindow.focus();


            setTimeout(
                function() {

                    printWindow.print();

                },
                300
            );

        }
    );

}


/* =========================================================
   46. CLOSE MODAL OUTSIDE
========================================================= */

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "receiptModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


/* =========================================================
   47. RESET BUTTON
========================================================= */

const resetSubscriptionBtn =
    document.getElementById(
        "resetSubscriptionBtn"
    );


if (
    resetSubscriptionBtn
) {

    resetSubscriptionBtn.addEventListener(
        "click",
        function() {

            setTimeout(
                function() {

                    resetSubscriptionForm();

                },
                0
            );

        }
    );

}


/* =========================================================
   48. CLOSE SEARCH OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !memberSearchInput ||
            !memberSuggestions
        ) {

            return;

        }


        if (
            event.target !==
            memberSearchInput &&
            !memberSuggestions.contains(
                event.target
            )
        ) {

            memberSuggestions.style.display =
                "none";

        }

    }
);


/* =========================================================
   49. PAGE INITIALIZATION
========================================================= */

function initializeSubscriptionPage() {

    loadSubscriptionData();

    loadSubscriptionYears();

    loadTransactionYears();

    setTodayDate();

    setDefaultAnnualAmount();

    displaySubscriptionTransactions();

    updateSubscriptionDashboard();

    updateMemberSummaryCards();

    displayMemberYearSubscription();

}


/* =========================================================
   50. DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSubscriptionPage
    );

}
else {

    initializeSubscriptionPage();

}


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM COMPLETE subscription.js loaded successfully."
);
