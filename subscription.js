/* =========================================================
   subscription.js - Part 1
   Initialization + Members + Years + Member Search
   मोर्डे ग्राम विकास मंडळ, मुंबई
========================================================= */


/* =========================================================
   LOCAL STORAGE
========================================================= */

let members =
    JSON.parse(
        localStorage.getItem("mgvm_members")
    ) || [];


let subscriptions =
    JSON.parse(
        localStorage.getItem("mgvm_subscriptions")
    ) || [];


/* =========================================================
   HTML ELEMENTS
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
   CURRENT SELECTED MEMBER
========================================================= */

let selectedMember = null;


/* =========================================================
   DEFAULT ANNUAL SUBSCRIPTION
========================================================= */

const DEFAULT_ANNUAL_AMOUNT = 200;


/* =========================================================
   CURRENT YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


/* =========================================================
   YEAR FORMAT
========================================================= */

function getFinancialYear(year) {

    return (
        year +
        "-" +
        String(year + 1).slice(-2)
    );

}


/* =========================================================
   GENERATE YEAR OPTIONS
========================================================= */

function loadSubscriptionYears() {

    if (!subscriptionYear) return;


    subscriptionYear.innerHTML = `
        <option value="">
            वर्ष निवडा
        </option>
    `;


    /*
       मागील 5 वर्षे
       + चालू वर्ष
       + पुढील 2 वर्षे
    */

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
            getFinancialYear(year);


        option.textContent =
            getFinancialYear(year);


        subscriptionYear.appendChild(
            option
        );

    }

}


/* =========================================================
   TRANSACTION YEAR FILTER
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
        function (item) {

            if (
                item.year &&
                !years.includes(item.year)
            ) {

                years.push(item.year);

            }

        }
    );


    years.sort();


    years.forEach(
        function (year) {

            const option =
                document.createElement(
                    "option"
                );


            option.value = year;

            option.textContent = year;


            filter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   TODAY DATE
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
        ).padStart(2, "0");


    const dd =
        String(
            today.getDate()
        ).padStart(2, "0");


    paymentDate.value =
        `${yyyy}-${mm}-${dd}`;

}


/* =========================================================
   DEFAULT ANNUAL AMOUNT
========================================================= */

function setDefaultAnnualAmount() {

    if (annualAmount) {

        annualAmount.value =
            DEFAULT_ANNUAL_AMOUNT;

    }

}


/* =========================================================
   MEMBER SEARCH
========================================================= */

if (memberSearchInput) {

    memberSearchInput.addEventListener(
        "input",
        function () {

            const keyword =
                memberSearchInput.value
                    .trim()
                    .toLowerCase();


            if (!memberSuggestions) return;


            memberSuggestions.innerHTML =
                "";


            if (!keyword) {

                memberSuggestions.style.display =
                    "none";

                return;

            }


            const results =
                members.filter(
                    function (member) {

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
                            name.includes(keyword) ||
                            id.includes(keyword) ||
                            mobile.includes(keyword)
                        );

                    }
                ).slice(0, 10);


            if (!results.length) {

                memberSuggestions.innerHTML = `
                    <div class="suggestion-item">
                        सभासद सापडला नाही.
                    </div>
                `;

                memberSuggestions.style.display =
                    "block";

                return;

            }


            results.forEach(
                function (member) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "suggestion-item";


                    item.innerHTML = `

                        <strong>
                            ${escapeSubscriptionHTML(
                                member.name
                            )}
                        </strong>

                        <br>

                        <small>
                            ${escapeSubscriptionHTML(
                                member.id || ""
                            )}
                            |
                            ${escapeSubscriptionHTML(
                                member.wadi || ""
                            )}
                            |
                            ${escapeSubscriptionHTML(
                                member.mobile || ""
                            )}
                        </small>

                    `;


                    item.addEventListener(
                        "click",
                        function () {

                            selectMember(
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
    );

}


/* =========================================================
   SELECT MEMBER
========================================================= */

function selectMember(member) {

    selectedMember =
        member;


    subscriptionMemberId.value =
        member.id || "";


    subscriptionMemberName.value =
        member.name || "";


    subscriptionWadi.value =
        member.wadi || "";


    memberSearchInput.value =
        member.name || "";


    if (memberSuggestions) {

        memberSuggestions.innerHTML =
            "";

        memberSuggestions.style.display =
            "none";

    }


    updateMemberSubscriptionSummary();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeSubscriptionHTML(value) {

    return String(value || "")
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
   FIND MEMBER BY ID
========================================================= */

function findMemberById(id) {

    return members.find(
        function (member) {

            return (
                String(member.id) ===
                String(id)
            );

        }
    ) || null;

}


/* =========================================================
   CALCULATE MEMBER YEAR PAYMENT
========================================================= */

function getMemberYearPayment(
    memberId,
    year
) {

    return subscriptions
        .filter(
            function (item) {

                return (
                    String(item.memberId) ===
                    String(memberId) &&
                    item.year === year
                );

            }
        )
        .reduce(
            function (total, item) {

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
   CALCULATE PENDING
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
            paidAmount.value || 0
        );


    const totalPaid =
        alreadyPaid +
        paidNow;


    const pending =
        DEFAULT_ANNUAL_AMOUNT -
        totalPaid;


    return Math.max(
        0,
        pending
    );

}


/* =========================================================
   UPDATE PENDING AMOUNT
========================================================= */

function updatePendingAmount() {

    if (!pendingAmount) return;


    pendingAmount.value =
        calculatePendingAmount();

}


/* =========================================================
   YEAR CHANGE
========================================================= */

if (subscriptionYear) {

    subscriptionYear.addEventListener(
        "change",
        function () {

            updatePendingAmount();

            updateMemberSubscriptionSummary();

        }
    );

}


/* =========================================================
   PAID AMOUNT CHANGE
========================================================= */

if (paidAmount) {

    paidAmount.addEventListener(
        "input",
        function () {

            updatePendingAmount();

        }
    );

}


/* =========================================================
   LOAD DEFAULT SETTINGS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSubscriptionYears();

        loadTransactionYears();

        setTodayDate();

        setDefaultAnnualAmount();

        updatePendingAmount();

    }
);
/* =========================================================
   subscription.js - Part 2
   Save Subscription + Validation + Receipt Number
========================================================= */


/* =========================================================
   SAVE LOCAL STORAGE
========================================================= */

function saveSubscriptions() {

    localStorage.setItem(
        "mgvm_subscriptions",
        JSON.stringify(subscriptions)
    );

}


/* =========================================================
   GENERATE RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

    let maxNumber = 0;


    subscriptions.forEach(
        function (item) {

            if (!item.receiptNo) return;


            const match =
                String(item.receiptNo)
                    .match(/MGVM-REC-(\d+)/i);


            if (match) {

                const number =
                    parseInt(
                        match[1],
                        10
                    );


                if (number > maxNumber) {

                    maxNumber = number;

                }

            }

        }
    );


    return (
        "MGVM-REC-" +
        String(maxNumber + 1)
            .padStart(4, "0")
    );

}


/* =========================================================
   CHECK EXISTING PAYMENT
========================================================= */

function getExistingYearPayment(
    memberId,
    year
) {

    return subscriptions
        .filter(
            function (item) {

                return (
                    String(item.memberId) ===
                    String(memberId) &&

                    item.year ===
                    year
                );

            }
        )
        .reduce(
            function (total, item) {

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
   FORM SUBMIT
========================================================= */

if (subscriptionForm) {

    subscriptionForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* =====================================
               MEMBER VALIDATION
            ===================================== */

            if (!selectedMember) {

                alert(
                    "कृपया प्रथम सभासद निवडा."
                );

                return;

            }


            if (
                !subscriptionMemberId.value
            ) {

                alert(
                    "सभासद आयडी उपलब्ध नाही."
                );

                return;

            }


            /* =====================================
               YEAR VALIDATION
            ===================================== */

            const year =
                subscriptionYear.value;


            if (!year) {

                alert(
                    "कृपया वर्गणी वर्ष निवडा."
                );

                return;

            }


            /* =====================================
               PAYMENT MODE VALIDATION
            ===================================== */

            if (!paymentMode.value) {

                alert(
                    "कृपया पेमेंट पद्धत निवडा."
                );

                return;

            }


            /* =====================================
               PAYMENT DATE VALIDATION
            ===================================== */

            if (!paymentDate.value) {

                alert(
                    "कृपया पेमेंट तारीख निवडा."
                );

                return;

            }


            /* =====================================
               PAID AMOUNT
            ===================================== */

            const amount =
                Number(
                    paidAmount.value || 0
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


            /* =====================================
               ANNUAL AMOUNT
            ===================================== */

            const annual =
                Number(
                    annualAmount.value ||
                    DEFAULT_ANNUAL_AMOUNT
                );


            /* =====================================
               EXISTING PAYMENT
            ===================================== */

            const alreadyPaid =
                getExistingYearPayment(
                    selectedMember.id,
                    year
                );


            /* =====================================
               TOTAL AFTER THIS PAYMENT
            ===================================== */

            const totalAfterPayment =
                alreadyPaid +
                amount;


            /* =====================================
               OVERPAYMENT CHECK
            ===================================== */

            if (
                totalAfterPayment >
                annual
            ) {

                const remaining =
                    Math.max(
                        0,
                        annual - alreadyPaid
                    );


                alert(
                    "या वर्षासाठी जास्तीत जास्त ₹" +
                    remaining +
                    " भरता येतील."
                );

                return;

            }


            /* =====================================
               RECEIPT NUMBER
            ===================================== */

            let finalReceiptNo =
                receiptNo.value.trim();


            if (!finalReceiptNo) {

                finalReceiptNo =
                    generateReceiptNumber();

            }


            /* =====================================
               DUPLICATE RECEIPT CHECK
            ===================================== */

            const receiptExists =
                subscriptions.some(
                    function (item) {

                        return (
                            String(
                                item.receiptNo
                            ).toLowerCase() ===
                            String(
                                finalReceiptNo
                            ).toLowerCase()
                        );

                    }
                );


            if (receiptExists) {

                alert(
                    "हा पावती क्रमांक आधीच वापरला आहे."
                );

                return;

            }


            /* =====================================
               CREATE SUBSCRIPTION OBJECT
            ===================================== */

            const subscription = {

                id:
                    "SUB-" +
                    Date.now(),

                memberId:
                    selectedMember.id,

                memberName:
                    selectedMember.name,

                wadi:
                    selectedMember.wadi || "",

                year:
                    year,

                annualAmount:
                    annual,

                paidAmount:
                    amount,

                pendingAmount:
                    Math.max(
                        0,
                        annual -
                        totalAfterPayment
                    ),

                receiptNo:
                    finalReceiptNo,

                paymentMode:
                    paymentMode.value,

                paymentDate:
                    paymentDate.value,

                enteredBy:
                    enteredBy.value.trim(),

                createdAt:
                    new Date().toISOString()

            };


            /* =====================================
               SAVE
            ===================================== */

            subscriptions.push(
                subscription
            );


            saveSubscriptions();


            /* =====================================
               UPDATE MEMBER PENDING
            ===================================== */

            updateMemberPendingAmount(
                selectedMember.id
            );


            /* =====================================
               REFRESH
            ===================================== */

            updatePendingAmount();

            updateMemberSubscriptionSummary();

            displaySubscriptions();

            displayYearWiseStatus();

            loadTransactionYears();


            /* =====================================
               RECEIPT
            ===================================== */

            showReceipt(
                subscription
            );


            /* =====================================
               TOAST
            ===================================== */

            showSubscriptionToast(
                "वर्गणी यशस्वीरित्या जतन झाली."
            );


            /* =====================================
               RESET PAYMENT FIELDS
            ===================================== */

            paidAmount.value =
                Math.max(
                    0,
                    annual -
                    totalAfterPayment
                ) === 0
                    ? 0
                    : Math.max(
                        0,
                        annual -
                        totalAfterPayment
                    );


            receiptNo.value = "";


        }
    );

}


/* =========================================================
   UPDATE MEMBER PENDING AMOUNT
========================================================= */

function updateMemberPendingAmount(
    memberId
) {

    const member =
        findMemberById(
            memberId
        );


    if (!member) return;


    let totalPending = 0;


    /*
       सर्व नोंदी तपासून
       प्रत्येक वर्षाची बाकी रक्कम
       मोजली जाते.
    */

    const memberYears = [];


    subscriptions
        .filter(
            function (item) {

                return (
                    String(item.memberId) ===
                    String(memberId)
                );

            }
        )
        .forEach(
            function (item) {

                if (
                    !memberYears.includes(
                        item.year
                    )
                ) {

                    memberYears.push(
                        item.year
                    );

                }

            }
        );


    memberYears.forEach(
        function (year) {

            const paid =
                getExistingYearPayment(
                    memberId,
                    year
                );


            const pending =
                Math.max(
                    0,
                    DEFAULT_ANNUAL_AMOUNT -
                    paid
                );


            totalPending +=
                pending;

        }
    );


    member.subscriptionPending =
        totalPending;


    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(members)
    );

}
/* =========================================================
   subscription.js - Part 3
   Transaction List + Year Wise Status
========================================================= */


/* =========================================================
   DISPLAY SUBSCRIPTIONS
========================================================= */

function displaySubscriptions(list = subscriptions) {

    const tableBody =
        document.getElementById(
            "subscriptionTableBody"
        );

    if (!tableBody) return;


    tableBody.innerHTML = "";


    if (!list.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" align="center">
                    अद्याप कोणतीही वर्गणी नोंद उपलब्ध नाही.
                </td>
            </tr>
        `;

        return;

    }


    list.forEach(
        function (item) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${formatSubscriptionDate(
                        item.paymentDate
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.memberId
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.memberName
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.year
                    )}
                </td>

                <td>
                    ₹${Number(
                        item.paidAmount || 0
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.paymentMode
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.receiptNo
                    )}
                </td>

                <td>

                    <button
                        class="btn btn-primary"
                        onclick="viewReceipt('${item.id}')">

                        <i class="fa fa-receipt"></i>

                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="deleteSubscription('${item.id}')">

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
   DATE FORMAT
========================================================= */

function formatSubscriptionDate(dateValue) {

    if (!dateValue) return "-";


    const parts =
        String(dateValue).split("-");


    if (parts.length !== 3) {

        return dateValue;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


/* =========================================================
   YEAR-WISE STATUS
========================================================= */

function displayYearWiseStatus() {

    const body =
        document.getElementById(
            "yearSubscriptionBody"
        );


    if (!body) return;


    body.innerHTML = "";


    if (!selectedMember) {

        body.innerHTML = `
            <tr>
                <td colspan="5" align="center">
                    सभासद निवडल्यानंतर
                    वर्षनिहाय माहिती येथे दिसेल.
                </td>
            </tr>
        `;

        return;

    }


    /*
       सदस्यासाठी उपलब्ध वर्षे
    */

    const years = [];


    subscriptions
        .filter(
            function (item) {

                return (
                    String(item.memberId) ===
                    String(selectedMember.id)
                );

            }
        )
        .forEach(
            function (item) {

                if (
                    item.year &&
                    !years.includes(item.year)
                ) {

                    years.push(item.year);

                }

            }
        );


    /*
       चालू वर्ष देखील दाखवा
    */

    const selectedYear =
        subscriptionYear.value;


    if (
        selectedYear &&
        !years.includes(selectedYear)
    ) {

        years.push(
            selectedYear
        );

    }


    years.sort();


    if (!years.length) {

        body.innerHTML = `
            <tr>
                <td colspan="5" align="center">
                    अद्याप वर्गणी नोंद उपलब्ध नाही.
                </td>
            </tr>
        `;

        return;

    }


    years.forEach(
        function (year) {

            const paid =
                getExistingYearPayment(
                    selectedMember.id,
                    year
                );


            const annual =
                DEFAULT_ANNUAL_AMOUNT;


            const pending =
                Math.max(
                    0,
                    annual - paid
                );


            let status = "";


            if (pending === 0) {

                status =
                    `<span class="status-paid">
                        पूर्ण भरले
                    </span>`;

            }
            else if (paid > 0) {

                status =
                    `<span class="status-partial">
                        अंशतः भरले
                    </span>`;

            }
            else {

                status =
                    `<span class="status-pending">
                        बाकी
                    </span>`;

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
   UPDATE SUMMARY CARDS
========================================================= */

function updateMemberSubscriptionSummary() {

    const annualCard =
        document.getElementById(
            "summaryAnnualAmount"
        );


    const paidCard =
        document.getElementById(
            "summaryPaidAmount"
        );


    const pendingCard =
        document.getElementById(
            "summaryPendingAmount"
        );


    const transactionCard =
        document.getElementById(
            "summaryTransactionCount"
        );


    if (
        !annualCard ||
        !paidCard ||
        !pendingCard ||
        !transactionCard
    ) {

        return;

    }


    if (!selectedMember) {

        annualCard.innerText =
            "₹0";

        paidCard.innerText =
            "₹0";

        pendingCard.innerText =
            "₹0";

        transactionCard.innerText =
            "0";

        return;

    }


    const memberTransactions =
        subscriptions.filter(
            function (item) {

                return (
                    String(item.memberId) ===
                    String(selectedMember.id)
                );

            }
        );


    const paid =
        memberTransactions.reduce(
            function (total, item) {

                return (
                    total +
                    Number(
                        item.paidAmount || 0
                    )
                );

            },
            0
        );


    /*
       प्रत्येक नोंद वेगळ्या वर्षाची
       असू शकते.
    */

    const uniqueYears = [];


    memberTransactions.forEach(
        function (item) {

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


    const selectedYear =
        subscriptionYear.value;


    if (
        selectedYear &&
        !uniqueYears.includes(
            selectedYear
        )
    ) {

        uniqueYears.push(
            selectedYear
        );

    }


    const annualTotal =
        uniqueYears.length *
        DEFAULT_ANNUAL_AMOUNT;


    const pending =
        Math.max(
            0,
            annualTotal - paid
        );


    annualCard.innerText =
        "₹" +
        annualTotal.toLocaleString(
            "en-IN"
        );


    paidCard.innerText =
        "₹" +
        paid.toLocaleString(
            "en-IN"
        );


    pendingCard.innerText =
        "₹" +
        pending.toLocaleString(
            "en-IN"
        );


    transactionCard.innerText =
        memberTransactions.length;


    displayYearWiseStatus();

}


/* =========================================================
   DELETE SUBSCRIPTION
========================================================= */

function deleteSubscription(id) {

    const index =
        subscriptions.findIndex(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );


    if (index === -1) {

        alert(
            "वर्गणी नोंद सापडली नाही."
        );

        return;

    }


    const item =
        subscriptions[index];


    const confirmDelete =
        confirm(
            "ही वर्गणी नोंद Delete करायची आहे का?\n\n" +
            "सभासद: " +
            item.memberName +
            "\n" +
            "वर्ष: " +
            item.year +
            "\n" +
            "रक्कम: ₹" +
            item.paidAmount
        );


    if (!confirmDelete) return;


    subscriptions.splice(
        index,
        1
    );


    saveSubscriptions();


    /*
       Member pending पुन्हा calculate
    */

    updateAllMemberPendingAmounts();


    displaySubscriptions();


    updateMemberSubscriptionSummary();


    displayYearWiseStatus();


    loadTransactionYears();


    showSubscriptionToast(
        "वर्गणी नोंद Delete झाली."
    );

}


/* =========================================================
   UPDATE ALL MEMBER PENDING AMOUNTS
========================================================= */

function updateAllMemberPendingAmounts() {

    members.forEach(
        function (member) {

            let totalPending = 0;


            const memberYears = [];


            subscriptions
                .filter(
                    function (item) {

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
                .forEach(
                    function (item) {

                        if (
                            item.year &&
                            !memberYears.includes(
                                item.year
                            )
                        ) {

                            memberYears.push(
                                item.year
                            );

                        }

                    }
                );


            memberYears.forEach(
                function (year) {

                    const paid =
                        getExistingYearPayment(
                            member.id,
                            year
                        );


                    totalPending +=
                        Math.max(
                            0,
                            DEFAULT_ANNUAL_AMOUNT -
                            paid
                        );

                }
            );


            member.subscriptionPending =
                totalPending;

        }
    );


    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(members)
    );

}


/* =========================================================
   INITIAL DISPLAY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displaySubscriptions();

        displayYearWiseStatus();

        updateMemberSubscriptionSummary();

    }
);

आता Part 4 मध्ये "Receipt Preview", "Print Receipt", "Search/Year Filter" आणि "Toast" functions जोडायच्या आहेत. त्या जोडल्यावर "subscription.js" पूर्ण होईल.

/* =========================================================
   subscription.js - Part 4
   Receipt + Search + Year Filter + Toast
========================================================= */


/* =========================================================
   SHOW RECEIPT
========================================================= */

function showReceipt(subscription) {

    const modal =
        document.getElementById(
            "receiptModal"
        );

    if (!modal) return;


    document.getElementById(
        "receiptPreviewNo"
    ).innerText =
        subscription.receiptNo || "-";


    document.getElementById(
        "receiptPreviewMemberId"
    ).innerText =
        subscription.memberId || "-";


    document.getElementById(
        "receiptPreviewName"
    ).innerText =
        subscription.memberName || "-";


    document.getElementById(
        "receiptPreviewWadi"
    ).innerText =
        subscription.wadi || "-";


    document.getElementById(
        "receiptPreviewYear"
    ).innerText =
        subscription.year || "-";


    document.getElementById(
        "receiptPreviewAmount"
    ).innerText =
        Number(
            subscription.paidAmount || 0
        ).toLocaleString(
            "en-IN"
        );


    document.getElementById(
        "receiptPreviewMode"
    ).innerText =
        subscription.paymentMode || "-";


    document.getElementById(
        "receiptPreviewDate"
    ).innerText =
        formatSubscriptionDate(
            subscription.paymentDate
        );


    modal.style.display =
        "block";


    window.currentReceipt =
        subscription;

}


/* =========================================================
   VIEW RECEIPT
========================================================= */

function viewReceipt(id) {

    const subscription =
        subscriptions.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );


    if (!subscription) {

        alert(
            "पावती नोंद सापडली नाही."
        );

        return;

    }


    showReceipt(
        subscription
    );

}


/* =========================================================
   CLOSE RECEIPT MODAL
========================================================= */

const closeReceiptModal =
    document.getElementById(
        "closeReceiptModal"
    );


if (closeReceiptModal) {

    closeReceiptModal.addEventListener(
        "click",
        function () {

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
   CLOSE MODAL ON OUTSIDE CLICK
========================================================= */

window.addEventListener(
    "click",
    function (event) {

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
   PRINT RECEIPT
========================================================= */

const printReceiptBtn =
    document.getElementById(
        "printReceiptBtn"
    );


if (printReceiptBtn) {

    printReceiptBtn.addEventListener(
        "click",
        function () {

            if (
                !window.currentReceipt
            ) {

                alert(
                    "प्रथम पावती निवडा."
                );

                return;

            }


            printSubscriptionReceipt(
                window.currentReceipt
            );

        }
    );

}


/* =========================================================
   PRINT SUBSCRIPTION RECEIPT
========================================================= */

function printSubscriptionReceipt(
    subscription
) {

    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Popup Blocker मुळे पावती Print करता आली नाही."
        );

        return;

    }


    const amount =
        Number(
            subscription.paidAmount || 0
        ).toLocaleString(
            "en-IN"
        );


    const date =
        formatSubscriptionDate(
            subscription.paymentDate
        );


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
                    "Noto Sans Devanagari",
                    Arial,
                    sans-serif;

                    margin: 0;

                    padding: 20px;

                    background: #fff;

                }


                .receipt {

                    max-width: 600px;

                    margin: auto;

                    border:
                    2px solid #333;

                    padding: 25px;

                    border-radius: 10px;

                }


                h1,
                h2,
                p {

                    text-align: center;

                }


                .line {

                    border-bottom:
                    1px solid #333;

                    margin: 15px 0;

                }


                .details {

                    margin-top: 20px;

                }


                .details p {

                    text-align: left;

                    margin: 10px 0;

                }


                .amount {

                    font-size: 24px;

                    font-weight: bold;

                    text-align: center;

                    margin: 20px 0;

                }


                .footer {

                    margin-top: 30px;

                    text-align: center;

                }


                @media print {

                    body {

                        padding: 0;

                    }

                    .receipt {

                        border:
                        2px solid #000;

                    }

                }

            </style>

        </head>


        <body>


            <div class="receipt">

                <h1>
                    मोर्डे ग्राम विकास मंडळ, मुंबई
                </h1>


                <h2>
                    वार्षिक वर्गणी पावती
                </h2>


                <div class="line"></div>


                <div class="details">

                    <p>
                        <strong>
                            पावती क्रमांक:
                        </strong>

                        ${escapeSubscriptionHTML(
                            subscription.receiptNo
                        )}
                    </p>


                    <p>
                        <strong>
                            Member ID:
                        </strong>

                        ${escapeSubscriptionHTML(
                            subscription.memberId
                        )}
                    </p>


                    <p>
                        <strong>
                            सभासद नाव:
                        </strong>

                        ${escapeSubscriptionHTML(
                            subscription.memberName
                        )}
                    </p>


                    <p>
                        <strong>
                            वाडी:
                        </strong>

                        ${escapeSubscriptionHTML(
                            subscription.wadi
                        )}
                    </p>


                    <p>
                        <strong>
                            वर्गणी वर्ष:
                        </strong>

                        ${escapeSubscriptionHTML(
                            subscription.year
                        )}
                    </p>


                    <p>
                        <strong>
                            पेमेंट पद्धत:
                        </strong>

                        ${escapeSubscriptionHTML(
                            subscription.paymentMode
                        )}
                    </p>


                    <p>
                        <strong>
                            तारीख:
                        </strong>

                        ${date}
                    </p>

                </div>


                <div class="line"></div>


                <div class="amount">

                    भरलेली रक्कम:
                    ₹${amount}

                </div>


                <div class="footer">

                    <p>
                        धन्यवाद!
                    </p>

                    <p>
                        मोर्डे ग्राम विकास मंडळ, मुंबई
                    </p>

                </div>

            </div>


            <script>

                window.onload =
                function() {

                    window.print();

                };

            <\/script>


        </body>

        </html>

    `);


    printWindow.document.close();

}


/* =========================================================
   SUBSCRIPTION SEARCH
========================================================= */

const subscriptionSearch =
    document.getElementById(
        "subscriptionSearch"
    );


if (subscriptionSearch) {

    subscriptionSearch.addEventListener(
        "input",
        filterSubscriptionTable
    );

}


/* =========================================================
   YEAR FILTER
========================================================= */

const transactionYearFilter =
    document.getElementById(
        "transactionYearFilter"
    );


if (transactionYearFilter) {

    transactionYearFilter.addEventListener(
        "change",
        filterSubscriptionTable
    );

}


/* =========================================================
   FILTER TRANSACTIONS
========================================================= */

function filterSubscriptionTable() {

    const keyword =
        subscriptionSearch
            ? subscriptionSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedYear =
        transactionYearFilter
            ? transactionYearFilter.value
            : "";


    const filtered =
        subscriptions.filter(
            function (item) {

                const searchableText = [

                    item.memberId,

                    item.memberName,

                    item.receiptNo,

                    item.wadi,

                    item.paymentMode,

                    item.year

                ]
                .join(" ")
                .toLowerCase();


                const matchesSearch =
                    !keyword ||
                    searchableText.includes(
                        keyword
                    );


                const matchesYear =
                    !selectedYear ||
                    item.year ===
                    selectedYear;


                return (
                    matchesSearch &&
                    matchesYear
                );

            }
        );


    displaySubscriptions(
        filtered
    );

}


/* =========================================================
   TOAST
========================================================= */

function showSubscriptionToast(
    message
) {

    const toast =
        document.getElementById(
            "subscriptionToast"
        );


    if (!toast) {

        alert(message);

        return;

    }


    toast.innerText =
        message;


    toast.style.display =
        "block";


    setTimeout(
        function () {

            toast.style.display =
                "none";

        },
        2500
    );

}


/* =========================================================
   RESET FORM
========================================================= */

const resetSubscriptionBtn =
    document.getElementById(
        "resetSubscriptionBtn"
    );


if (resetSubscriptionBtn) {

    resetSubscriptionBtn.addEventListener(
        "click",
        function () {

            setTimeout(
                function () {

                    selectedMember =
                        null;


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


                    setDefaultAnnualAmount();

                    setTodayDate();

                    updatePendingAmount();

                    updateMemberSubscriptionSummary();

                    displayYearWiseStatus();

                },
                0
            );

        }
    );

}


/* =========================================================
   FINAL PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displaySubscriptions();

        loadTransactionYears();

        updateMemberSubscriptionSummary();

    }
);
