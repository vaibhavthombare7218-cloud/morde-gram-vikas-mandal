/* =========================================================
   subscription.js
   CORRECTED FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   Features:
   ✅ Member Name Search
   ✅ Member ID / Mobile / Wadi Search
   ✅ Member Select
   ✅ Member ID / Wadi Auto Fill
   ✅ Annual Subscription ₹200
   ✅ Year-wise Pending
   ✅ Partial Payment
   ✅ Receipt Number
   ✅ Payment Mode
   ✅ Payment Date
   ✅ Save Subscription
   ✅ Delete Transaction
   ✅ Member Pending Sync
   ✅ Transaction Year Filter
   ✅ Dashboard Sync
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
                localStorage.getItem("mgvm_members")
            ) || [];

    } catch (error) {

        console.error("Members Load Error:", error);
        members = [];

    }


    try {

        subscriptions =
            JSON.parse(
                localStorage.getItem("mgvm_subscriptions")
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
   3. SAVE DATA
========================================================= */

function saveMembers() {

    try {

        localStorage.setItem(
            "mgvm_members",
            JSON.stringify(members)
        );

    } catch (error) {

        console.error(
            "Save Members Error:",
            error
        );

    }

}


function saveSubscriptions() {

    try {

        localStorage.setItem(
            "mgvm_subscriptions",
            JSON.stringify(subscriptions)
        );

    } catch (error) {

        console.error(
            "Save Subscription Error:",
            error
        );

    }

}


/* =========================================================
   4. DOM ELEMENTS
========================================================= */

const subscriptionForm =
    document.getElementById("subscriptionForm");

const memberSearchInput =
    document.getElementById("memberSearch");

const memberSuggestions =
    document.getElementById("memberSuggestions");

const subscriptionMemberId =
    document.getElementById("subscriptionMemberId");

const subscriptionMemberName =
    document.getElementById("subscriptionMemberName");

const subscriptionWadi =
    document.getElementById("subscriptionWadi");

const subscriptionYear =
    document.getElementById("subscriptionYear");

const annualAmount =
    document.getElementById("annualAmount");

const paidAmount =
    document.getElementById("paidAmount");

const pendingAmount =
    document.getElementById("pendingAmount");

const receiptNo =
    document.getElementById("receiptNo");

const paymentMode =
    document.getElementById("paymentMode");

const paymentDate =
    document.getElementById("paymentDate");

const enteredBy =
    document.getElementById("enteredBy");

const transactionYearFilter =
    document.getElementById(
        "transactionYearFilter"
    );


/* =========================================================
   5. CURRENT YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


/* =========================================================
   6. FINANCIAL YEAR
========================================================= */

function getFinancialYear(year) {

    return (
        year +
        "-" +
        String(year + 1).slice(-2)
    );

}


/* =========================================================
   7. LOAD YEARS
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

        const fy =
            getFinancialYear(year);


        const option =
            document.createElement("option");


        option.value = fy;
        option.textContent = fy;


        subscriptionYear.appendChild(
            option
        );

    }

}


/* =========================================================
   8. LOAD TRANSACTION YEARS
========================================================= */

function loadTransactionYears() {

    if (!transactionYearFilter) return;


    const currentValue =
        transactionYearFilter.value;


    transactionYearFilter.innerHTML = `

        <option value="">
            सर्व वर्षे
        </option>

    `;


    const years = [];


    subscriptions.forEach(
        function(item) {

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
        function(year) {

            const option =
                document.createElement("option");


            option.value = year;
            option.textContent = year;


            transactionYearFilter.appendChild(
                option
            );

        }
    );


    if (
        years.includes(currentValue)
    ) {

        transactionYearFilter.value =
            currentValue;

    }

}


/* =========================================================
   9. TODAY DATE
========================================================= */

function setTodayDate() {

    if (!paymentDate) return;


    const today = new Date();


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
   10. DEFAULT ANNUAL AMOUNT
========================================================= */

function setDefaultAnnualAmount() {

    if (annualAmount) {

        annualAmount.value =
            DEFAULT_ANNUAL_AMOUNT;

    }

}


/* =========================================================
   11. HTML ESCAPE
========================================================= */

function escapeSubscriptionHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   12. NORMALIZE SEARCH TEXT

   Important:
   Name search problem fix
   - Marathi / English both supported
   - Extra spaces removed
   - Case insensitive
========================================================= */

function normalizeSearchText(value) {

    return String(value ?? "")
        .trim()
        .toLocaleLowerCase("mr-IN")
        .replace(/\s+/g, " ");

}


/* =========================================================
   13. MEMBER SEARCH
========================================================= */

function searchSubscriptionMembers() {

    /*
       Always get latest members data.
    */

    try {

        const latestMembers =
            JSON.parse(
                localStorage.getItem(
                    "mgvm_members"
                )
            );

        if (
            Array.isArray(latestMembers)
        ) {

            members =
                latestMembers;

        }

    } catch (error) {

        console.error(
            "Latest Members Load Error:",
            error
        );

    }


    if (
        !memberSearchInput ||
        !memberSuggestions
    ) {

        return;

    }


    const keyword =
        normalizeSearchText(
            memberSearchInput.value
        );


    memberSuggestions.innerHTML =
        "";


    if (!keyword) {

        memberSuggestions.style.display =
            "none";

        return;

    }


    /*
       Search:
       1. Name
       2. Member ID
       3. Mobile
       4. Wadi
    */

    const results =
        members.filter(
            function(member) {

                const name =
                    normalizeSearchText(
                        member.name
                    );


                const id =
                    normalizeSearchText(
                        member.id
                    );


                const mobile =
                    normalizeSearchText(
                        member.mobile
                    );


                const wadi =
                    normalizeSearchText(
                        member.wadi
                    );


                return (

                    name.includes(keyword) ||

                    id.includes(keyword) ||

                    mobile.includes(keyword) ||

                    wadi.includes(keyword)

                );

            }
        )
        .slice(0, 20);


    if (!results.length) {

        memberSuggestions.innerHTML = `

            <div class="suggestion-item">

                <i class="fa fa-user-slash"></i>

                &nbsp; सभासद सापडला नाही.

            </div>

        `;

        memberSuggestions.style.display =
            "block";

        return;

    }


    results.forEach(
        function(member) {

            const item =
                document.createElement("div");


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
                function(event) {

                    event.preventDefault();
                    event.stopPropagation();

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
   14. SEARCH EVENT
========================================================= */

if (memberSearchInput) {

    memberSearchInput.addEventListener(
        "input",
        searchSubscriptionMembers
    );


    memberSearchInput.addEventListener(
        "focus",
        function() {

            if (
                memberSearchInput.value.trim()
            ) {

                searchSubscriptionMembers();

            }

        }
    );

}


/* =========================================================
   15. SELECT MEMBER
========================================================= */

function selectSubscriptionMember(
    member
) {

    if (!member) return;


    selectedMember = {
        ...member
    };


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
   16. FIND MEMBER BY ID
========================================================= */

function findMemberById(id) {

    loadSubscriptionData();


    return members.find(
        function(member) {

            return (
                String(member.id).trim() ===
                String(id).trim()
            );

        }
    ) || null;

}


/* =========================================================
   17. GET YEAR PAYMENT
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
                    ).trim() ===
                    String(
                        memberId
                    ).trim() &&

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
            function(total, item) {

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
   18. CALCULATE PENDING
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
   19. UPDATE PENDING
========================================================= */

function updatePendingAmount() {

    if (!pendingAmount) return;


    pendingAmount.value =
        calculatePendingAmount();

}


/* =========================================================
   20. MEMBER SUMMARY
========================================================= */

function updateMemberSubscriptionSummary() {

    const summary =
        document.getElementById(
            "memberSubscriptionSummary"
        );


    if (!summary) return;


    if (
        !selectedMember ||
        !subscriptionYear ||
        !subscriptionYear.value
    ) {

        summary.innerHTML =
            "";

        return;

    }


    const year =
        subscriptionYear.value;


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
   21. YEAR CHANGE
========================================================= */

if (subscriptionYear) {

    subscriptionYear.addEventListener(
        "change",
        function() {

            updateMemberSubscriptionSummary();

            updatePendingAmount();

        }
    );

}


/* =========================================================
   22. PAID AMOUNT CHANGE
========================================================= */

if (paidAmount) {

    paidAmount.addEventListener(
        "input",
        updatePendingAmount
    );

}


/* =========================================================
   23. ANNUAL AMOUNT CHANGE
========================================================= */

if (annualAmount) {

    annualAmount.addEventListener(
        "input",
        updatePendingAmount
    );

}


/* =========================================================
   24. GENERATE RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

    loadSubscriptionData();


    let maxNumber = 0;


    subscriptions.forEach(
        function(item) {

            const match =
                String(
                    item.receiptNo || ""
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
                    number > maxNumber
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
   25. FORM SUBMIT
========================================================= */

if (subscriptionForm) {

    subscriptionForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            loadSubscriptionData();


            /*
               If member was not selected,
               try Member ID.
            */

            if (!selectedMember) {

                if (
                    subscriptionMemberId &&
                    subscriptionMemberId.value.trim()
                ) {

                    selectedMember =
                        findMemberById(
                            subscriptionMemberId.value
                        );

                }

            }


            if (!selectedMember) {

                alert(
                    "कृपया प्रथम सभासद Search करून Select करा."
                );

                return;

            }


            /* YEAR */

            const year =
                subscriptionYear
                ?
                subscriptionYear.value
                :
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


            /* PAID AMOUNT */

            const amount =
                Number(
                    paidAmount
                    ?
                    paidAmount.value
                    :
                    0
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


            /* ANNUAL */

            const annual =
                Number(
                    annualAmount
                    ?
                    annualAmount.value
                    :
                    DEFAULT_ANNUAL_AMOUNT
                );


            if (
                !Number.isFinite(annual) ||
                annual <= 0
            ) {

                alert(
                    "वार्षिक वर्गणी रक्कम योग्य टाका."
                );

                return;

            }


            /* ALREADY PAID */

            const alreadyPaid =
                getMemberYearPayment(
                    selectedMember.id,
                    year
                );


            /* OVER PAYMENT */

            if (
                alreadyPaid + amount >
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
                receiptNo
                ?
                receiptNo.value.trim()
                :
                "";


            if (!finalReceiptNo) {

                finalReceiptNo =
                    generateReceiptNumber();

            }


            /* DUPLICATE RECEIPT */

            const receiptExists =
                subscriptions.some(
                    function(item) {

                        return (
                            String(
                                item.receiptNo || ""
                            )
                            .trim()
                            .toLowerCase()
                            ===
                            finalReceiptNo
                                .trim()
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
                    Date.now() +
                    "-" +
                    Math.floor(
                        Math.random() * 1000
                    ),

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
                    paymentMode
                    ?
                    paymentMode.value
                    :
                    "",

                paymentDate:
                    paymentDate
                    ?
                    paymentDate.value
                    :
                    "",

                enteredBy:
                    enteredBy
                    ?
                    enteredBy.value.trim()
                    :
                    "",

                createdAt:
                    new Date().toISOString()

            };


            subscriptions.push(
                transaction
            );


            saveSubscriptions();


            /*
               Update member pending
            */

            recalculateMemberPending(
                selectedMember.id
            );


            /*
               Refresh
            */

            loadSubscriptionData();

            loadTransactionYears();

            displaySubscriptionTransactions();


            showSubscriptionToast(
                "वर्गणी यशस्वीरित्या जतन झाली."
            );


            resetSubscriptionForm();

        }
    );

}


/* =========================================================
   26. RECALCULATE MEMBER PENDING
========================================================= */

function recalculateMemberPending(
    memberId
) {

    loadSubscriptionData();


    const memberIndex =
        members.findIndex(
            function(member) {

                return (
                    String(member.id).trim() ===
                    String(memberId).trim()
                );

            }
        );


    if (memberIndex === -1) {

        return;

    }


    const memberTransactions =
        subscriptions.filter(
            function(item) {

                return (
                    String(
                        item.memberId
                    ).trim() ===
                    String(
                        memberId
                    ).trim()
                );

            }
        );


    const yearMap = {};


    memberTransactions.forEach(
        function(item) {

            const year =
                item.year;


            if (!year) return;


            if (
                !Object.prototype.hasOwnProperty.call(
                    yearMap,
                    year
                )
            ) {

                yearMap[year] = 0;

            }


            yearMap[year] +=
                Number(
                    item.paidAmount || 0
                );

        }
    );


    let totalPending = 0;


    Object.keys(
        yearMap
    ).forEach(
        function(year) {

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


/* =========================================================
   27. RESET FORM
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


    if (annualAmount) {

        annualAmount.value =
            DEFAULT_ANNUAL_AMOUNT;

    }


    setTodayDate();

    updatePendingAmount();

    updateMemberSubscriptionSummary();

}


/* =========================================================
   28. TOAST
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


    toast.innerText =
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
   29. DISPLAY TRANSACTIONS
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
                function(item) {

                    return (
                        String(item.year) ===
                        String(filterYear)
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
        function(item, index) {

            const row =
                document.createElement("tr");


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
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    ₹${Number(
                        item.paidAmount || 0
                    ).toLocaleString("en-IN")}
                </td>

                <td>
                    ₹${Number(
                        item.pendingAmount || 0
                    ).toLocaleString("en-IN")}
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
                        onclick="deleteSubscription('${String(
                            item.id
                        ).replace(
                            /'/g,
                            "\\'"
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
   30. TRANSACTION FILTER
========================================================= */

if (transactionYearFilter) {

    transactionYearFilter.addEventListener(
        "change",
        function() {

            displaySubscriptionTransactions(
                this.value
            );

        }
    );

}


/* =========================================================
   31. DELETE SUBSCRIPTION
========================================================= */

function deleteSubscription(
    transactionId
) {

    loadSubscriptionData();


    const transaction =
        subscriptions.find(
            function(item) {

                return (
                    String(item.id) ===
                    String(transactionId)
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
            function(item) {

                return (
                    String(item.id) !==
                    String(transactionId)
                );

            }
        );


    saveSubscriptions();


    recalculateMemberPending(
        transaction.memberId
    );


    loadSubscriptionData();

    loadTransactionYears();

    displaySubscriptionTransactions(
        transactionYearFilter
        ?
        transactionYearFilter.value
        :
        ""
    );

    updateSubscriptionDashboard();


    showSubscriptionToast(
        "वर्गणी नोंद Delete झाली."
    );

}


/* =========================================================
   32. DASHBOARD
========================================================= */

function updateSubscriptionDashboard() {

    loadSubscriptionData();


    const totalSubscription =
        subscriptions.reduce(
            function(total, item) {

                return (
                    total +
                    Number(
                        item.paidAmount || 0
                    )
                );

            },
            0
        );


    const totalElement =
        document.getElementById(
            "totalSubscription"
        );


    if (totalElement) {

        totalElement.innerText =
            "₹" +
            totalSubscription.toLocaleString(
                "en-IN"
            );

    }


    /*
       Current Financial Year
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
                    item.year ===
                    currentFinancialYear
                );

            }
        )
        .reduce(
            function(total, item) {

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
       Today's Collection
    */

    const today =
        new Date();


    const todayString =
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            today.getDate()
        ).padStart(2, "0");


    const todayTotal =
        subscriptions
        .filter(
            function(item) {

                return (
                    item.paymentDate ===
                    todayString
                );

            }
        )
        .reduce(
            function(total, item) {

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
   33. CLOSE SEARCH OUTSIDE
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
   34. PAGE INITIALIZATION
========================================================= */

function initializeSubscriptionPage() {

    loadSubscriptionData();

    loadSubscriptionYears();

    loadTransactionYears();

    setTodayDate();

    setDefaultAnnualAmount();

    displaySubscriptionTransactions();

    updateSubscriptionDashboard();

    updatePendingAmount();

}


/* =========================================================
   35. DOM READY
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
    "MGVM Corrected subscription.js loaded successfully."
);
