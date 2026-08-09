/* =========================================================
   subscription.js - COMPLETE FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   Features:
   1. Member Search
   2. Member Select
   3. Member ID / Wadi Auto Fill
   4. Annual Subscription ₹200
   5. Pending Amount
   6. Partial Payment
   7. Receipt Number
   8. Payment Mode
   9. Payment Date
   10. Save Subscription
   11. Update Member Pending Amount
   12. Transaction List
   13. Year Filter
   14. Delete Transaction
   15. Dashboard Sync
========================================================= */


/* =========================================================
   GLOBAL DATA
========================================================= */

let members = [];

let subscriptions = [];

let selectedMember = null;

const DEFAULT_ANNUAL_AMOUNT = 200;


/* =========================================================
   LOAD LOCAL STORAGE
========================================================= */

function loadSubscriptionData() {

    try {

        members =
            JSON.parse(
                localStorage.getItem("mgvm_members")
            ) || [];

    } catch (error) {

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

    } catch (error) {

        console.error(
            "Subscriptions Load Error:",
            error
        );

        subscriptions = [];

    }

}


/* =========================================================
   SAVE MEMBERS
========================================================= */

function saveMembers() {

    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(members)
    );

}


/* =========================================================
   SAVE SUBSCRIPTIONS
========================================================= */

function saveSubscriptions() {

    localStorage.setItem(
        "mgvm_subscriptions",
        JSON.stringify(subscriptions)
    );

}


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
   CURRENT YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


/* =========================================================
   FINANCIAL YEAR
========================================================= */

function getFinancialYear(year) {

    return (
        year +
        "-" +
        String(year + 1).slice(-2)
    );

}


/* =========================================================
   LOAD YEAR OPTIONS
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
            getFinancialYear(year);


        option.textContent =
            getFinancialYear(year);


        subscriptionYear.appendChild(
            option
        );

    }

}


/* =========================================================
   LOAD TRANSACTION YEAR FILTER
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
   HTML ESCAPE
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
   MEMBER SEARCH
========================================================= */

function searchSubscriptionMembers() {

    /*
       Always reload latest member data.
       त्यामुळे members.html वर नवीन member save
       केल्यानंतर subscription page ला data मिळेल.
    */

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
            function (member) {

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
        function (member) {

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
                function () {

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


/* =========================================================
   MEMBER SEARCH EVENT
========================================================= */

if (memberSearchInput) {

    memberSearchInput.addEventListener(
        "input",
        searchSubscriptionMembers
    );

}


/* =========================================================
   SELECT MEMBER
========================================================= */

function selectSubscriptionMember(
    member
) {

    selectedMember =
        member;


    if (subscriptionMemberId) {

        subscriptionMemberId.value =
            member.id || "";

    }


    if (subscriptionMemberName) {

        subscriptionMemberName.value =
            member.name || "";

    }


    if (subscriptionWadi) {

        subscriptionWadi.value =
            member.wadi || "";

    }


    if (memberSearchInput) {

        memberSearchInput.value =
            member.name || "";

    }


    if (memberSuggestions) {

        memberSuggestions.innerHTML =
            "";

        memberSuggestions.style.display =
            "none";

    }


    updateMemberSubscriptionSummary();

    updatePendingAmount();

}


/* =========================================================
   FIND MEMBER
========================================================= */

function findMemberById(id) {

    loadSubscriptionData();


    return members.find(
        function (member) {

            return (
                String(
                    member.id
                ) ===
                String(id)
            );

        }
    ) || null;

}


/* =========================================================
   GET YEAR PAYMENT
========================================================= */

function getMemberYearPayment(
    memberId,
    year
) {

    return subscriptions
        .filter(
            function (item) {

                return (

                    String(
                        item.memberId
                    ) ===
                    String(
                        memberId
                    ) &&

                    item.year ===
                    year

                );

            }
        )
        .reduce(
            function (
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
            paidAmount ?
            paidAmount.value :
            0
        );


    const annual =
        Number(
            annualAmount ?
            annualAmount.value :
            DEFAULT_ANNUAL_AMOUNT
        );


    return Math.max(
        0,
        annual -
        alreadyPaid -
        paidNow
    );

}


/* =========================================================
   UPDATE PENDING
========================================================= */

function updatePendingAmount() {

    if (!pendingAmount) return;


    pendingAmount.value =
        calculatePendingAmount();

}


/* =========================================================
   MEMBER SUBSCRIPTION SUMMARY
========================================================= */

function updateMemberSubscriptionSummary() {

    if (!selectedMember) return;


    const summary =
        document.getElementById(
            "memberSubscriptionSummary"
        );


    if (!summary) return;


    const year =
        subscriptionYear ?
        subscriptionYear.value :
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


    const pending =
        Math.max(
            0,
            DEFAULT_ANNUAL_AMOUNT -
            alreadyPaid
        );


    summary.innerHTML = `

        <div class="subscription-summary">

            <strong>
                ${escapeSubscriptionHTML(
                    selectedMember.name
                )}
            </strong>

            <div>
                वर्ष: ${escapeSubscriptionHTML(
                    year
                )}
            </div>

            <div>
                वार्षिक वर्गणी:
                ₹${DEFAULT_ANNUAL_AMOUNT}
            </div>

            <div>
                आधी भरलेली:
                ₹${alreadyPaid}
            </div>

            <div>
                बाकी:
                ₹${pending}
            </div>

        </div>

    `;

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
   GENERATE RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

    let maxNumber = 0;


    subscriptions.forEach(
        function (item) {

            if (!item.receiptNo) return;


            const match =
                String(
                    item.receiptNo
                )
                .match(
                    /MGVM-REC-(\d+)/i
                );


            if (match) {

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

        }
    );


    return (
        "MGVM-REC-" +
        String(
            maxNumber + 1
        ).padStart(
            4,
            "0"
        )
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


            loadSubscriptionData();


            /* MEMBER */

            if (!selectedMember) {

                /*
                   Search box मधून member select नसेल
                   तर ID वरून शोधण्याचा प्रयत्न.
                */

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


            /* YEAR */

            const year =
                subscriptionYear ?
                subscriptionYear.value :
                "";


            if (!year) {

                alert(
                    "कृपया वर्गणी वर्ष निवडा."
                );

                return;

            }


            /* PAYMENT MODE */

            if (
                paymentMode &&
                !paymentMode.value
            ) {

                alert(
                    "कृपया पेमेंट पद्धत निवडा."
                );

                return;

            }


            /* PAYMENT DATE */

            if (
                paymentDate &&
                !paymentDate.value
            ) {

                alert(
                    "कृपया पेमेंट तारीख निवडा."
                );

                return;

            }


            /* AMOUNT */

            const amount =
                Number(
                    paidAmount ?
                    paidAmount.value :
                    0
                );


            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                alert(
                    "कृपया योग्य वर्गणी रक्कम टाका."
                );

                return;

            }


            /* ANNUAL */

            const annual =
                Number(
                    annualAmount ?
                    annualAmount.value :
                    DEFAULT_ANNUAL_AMOUNT
                );


            /* ALREADY PAID */

            const alreadyPaid =
                getMemberYearPayment(
                    selectedMember.id,
                    year
                );


            /* OVER PAYMENT */

            if (
                alreadyPaid +
                amount >
                annual
            ) {

                const remaining =
                    Math.max(
                        0,
                        annual -
                        alreadyPaid
                    );


                alert(
                    "या वर्षासाठी फक्त ₹" +
                    remaining +
                    " बाकी आहे."
                );

                return;

            }


            /* RECEIPT */

            let finalReceiptNo =
                receiptNo ?
                receiptNo.value.trim() :
                "";


            if (!finalReceiptNo) {

                finalReceiptNo =
                    generateReceiptNumber();

            }


            /* DUPLICATE RECEIPT */

            const receiptExists =
                subscriptions.some(
                    function (item) {

                        return (
                            String(
                                item.receiptNo
                            )
                            .toLowerCase() ===
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


            /* =================================================
               CREATE TRANSACTION
            ================================================= */

            const transaction = {

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
                        alreadyPaid -
                        amount
                    ),

                receiptNo:
                    finalReceiptNo,

                paymentMode:
                    paymentMode ?
                    paymentMode.value :
                    "",

                paymentDate:
                    paymentDate ?
                    paymentDate.value :
                    "",

                enteredBy:
                    enteredBy ?
                    enteredBy.value.trim() :
                    "",

                createdAt:
                    new Date().toISOString()

            };


            /* SAVE TRANSACTION */

            subscriptions.push(
                transaction
            );

            saveSubscriptions();


            /* =================================================
               UPDATE MEMBER PENDING
            ================================================= */

            const memberIndex =
                members.findIndex(
                    function (member) {

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
                memberIndex !== -1
            ) {

                /*
                   Existing member total pending
                   update करण्यासाठी yearly data
                   पुन्हा calculate केला जातो.
                */

                let totalPending = 0;


                /*
                   Member च्या आधीच्या
                   subscriptionPending ला
                   direct overwrite न करता,
                   current saved subscriptions
                   वरून current year pending ठेवतो.
                */

                const memberTransactions =
                    subscriptions.filter(
                        function (item) {

                            return (
                                String(
                                    item.memberId
                                ) ===
                                String(
                                    selectedMember.id
                                )
                            );

                        }
                    );


                /*
                   सर्व transaction years
                   calculate करा.
                */

                const yearMap = {};


                memberTransactions.forEach(
                    function (item) {

                        if (
                            !yearMap[
                                item.year
                            ]
                        ) {

                            yearMap[
                                item.year
                            ] = 0;

                        }


                        yearMap[
                            item.year
                        ] +=
                            Number(
                                item.paidAmount || 0
                            );

                    }
                );


                Object.keys(
                    yearMap
                ).forEach(
                    function (paymentYear) {

                        const paid =
                            yearMap[
                                paymentYear
                            ];


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


                members[
                    memberIndex
                ].subscriptionPending =
                    totalPending;


                saveMembers();

            }


            /* =================================================
               SUCCESS
            ================================================= */

            showSubscriptionToast(
                "वर्गणी यशस्वीरित्या जतन झाली."
            );


            /* REFRESH */

            loadSubscriptionData();

            loadTransactionYears();

            displaySubscriptionTransactions();


            /* RESET */

            resetSubscriptionForm();

        }
    );

}


/* =========================================================
   RESET FORM
========================================================= */

function resetSubscriptionForm() {

    selectedMember = null;


    if (subscriptionForm) {

        subscriptionForm.reset();

    }


    if (memberSearchInput) {

        memberSearchInput.value =
            "";

    }


    if (memberSuggestions) {

        memberSuggestions.innerHTML =
            "";

        memberSuggestions.style.display =
            "none";

    }


    if (subscriptionMemberId) {

        subscriptionMemberId.value =
            "";

    }


    if (subscriptionMemberName) {

        subscriptionMemberName.value =
            "";

    }


    if (subscriptionWadi) {

        subscriptionWadi.value =
            "";

    }


    setDefaultAnnualAmount();

    setTodayDate();

    updatePendingAmount();

}


/* =========================================================
   TOAST
========================================================= */

function showSubscriptionToast(
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
        function () {

            toast.style.display =
                "none";

        },
        2500
    );

}


/* =========================================================
   DISPLAY TRANSACTIONS
========================================================= */

function displaySubscriptionTransactions(
    filterYear = ""
) {

    const tableBody =
        document.getElementById(
            "subscriptionTableBody"
        );


    if (!tableBody) return;


    loadSubscriptionData();


    let data =
        [...subscriptions];


    if (filterYear) {

        data =
            data.filter(
                function (item) {

                    return (
                        item.year ===
                        filterYear
                    );

                }
            );

    }


    data.reverse();


    if (!data.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    style="text-align:center;"
                >

                    अद्याप कोणतीही वर्गणी नोंद उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        "";


    data.forEach(
        function (
            item,
            index
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.receiptNo
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.memberName
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.wadi
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.year
                    )}
                </td>

                <td>
                    ₹${Number(
                        item.annualAmount || 0
                    )}
                </td>

                <td>
                    ₹${Number(
                        item.paidAmount || 0
                    )}
                </td>

                <td>
                    ₹${Number(
                        item.pendingAmount || 0
                    )}
                </td>

                <td>
                    ${escapeSubscriptionHTML(
                        item.paymentMode
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteSubscription('${escapeSubscriptionHTML(
                            item.id
                        )}')"
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
   YEAR FILTER EVENT
========================================================= */

const transactionYearFilter =
    document.getElementById(
        "transactionYearFilter"
    );


if (transactionYearFilter) {

    transactionYearFilter.addEventListener(
        "change",
        function () {

            displaySubscriptionTransactions(
                this.value
            );

        }
    );

}


/* =========================================================
   DELETE SUBSCRIPTION
========================================================= */

function deleteSubscription(
    transactionId
) {

    loadSubscriptionData();


    const transaction =
        subscriptions.find(
            function (item) {

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


    subscriptions =
        subscriptions.filter(
            function (item) {

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
       Recalculate member pending
    */

    const memberIndex =
        members.findIndex(
            function (member) {

                return (
                    String(
                        member.id
                    ) ===
                    String(
                        transaction.memberId
                    )
                );

            }
        );


    if (
        memberIndex !== -1
    ) {

        const memberTransactions =
            subscriptions.filter(
                function (item) {

                    return (
                        String(
                            item.memberId
                        ) ===
                        String(
                            transaction.memberId
                        )
                    );

                }
            );


        const yearMap = {};


        memberTransactions.forEach(
            function (item) {

                if (
                    !yearMap[
                        item.year
                    ]
                ) {

                    yearMap[
                        item.year
                    ] = 0;

                }


                yearMap[
                    item.year
                ] +=
                    Number(
                        item.paidAmount || 0
                    );

            }
        );


        let totalPending = 0;


        Object.keys(
            yearMap
        ).forEach(
            function (year) {

                totalPending +=
                    Math.max(
                        0,
                        DEFAULT_ANNUAL_AMOUNT -
                        yearMap[year]
                    );

            }
        );


        members[
            memberIndex
        ].subscriptionPending =
            totalPending;


        saveMembers();

    }


    loadTransactionYears();

    displaySubscriptionTransactions();

    showSubscriptionToast(
        "वर्गणी नोंद Delete झाली."
    );

}


/* =========================================================
   DASHBOARD UPDATE
========================================================= */

function updateSubscriptionDashboard() {

    loadSubscriptionData();


    const totalSubscription =
        subscriptions.reduce(
            function (
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
            totalSubscription;

    }


    /*
       Current year collection
    */

    const currentFinancialYear =
        getFinancialYear(
            currentYear
        );


    const yearTotal =
        subscriptions
        .filter(
            function (item) {

                return (
                    item.year ===
                    currentFinancialYear
                );

            }
        )
        .reduce(
            function (
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
            yearTotal;

    }


    /*
       Today's collection
    */

    const today =
        new Date()
        .toISOString()
        .slice(
            0,
            10
        );


    const todayTotal =
        subscriptions
        .filter(
            function (item) {

                return (
                    item.paymentDate ===
                    today
                );

            }
        )
        .reduce(
            function (
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
            todayTotal;

    }

}


/* =========================================================
   CLOSE SEARCH WHEN CLICK OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function (event) {

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
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSubscriptionData();

        loadSubscriptionYears();

        loadTransactionYears();

        setTodayDate();

        setDefaultAnnualAmount();

        displaySubscriptionTransactions();

        updateSubscriptionDashboard();

        updatePendingAmount();

    }
);
