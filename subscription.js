/* =========================================================
   subscription.js
   CORRECTED FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   LOGIC:
   ✅ mgvm_members compatible
   ✅ Excel imported subscriptionPending supported
   ✅ Old pending preserved
   ✅ New financial year ₹200 supported
   ✅ Partial payment supported
   ✅ Payment reduces member pending
   ✅ Delete payment restores member pending
   ✅ Existing transactions preserved
   ✅ Member search सुरक्षित
   ✅ Wadi Report compatible
========================================================= */


/* =========================================================
   1. GLOBAL DATA
========================================================= */

let members = [];

let subscriptions = [];

let selectedMember = null;

const DEFAULT_ANNUAL_AMOUNT =
    Number(
        localStorage.getItem("mgvm_annual_subscription_amount")
    ) || 200;


/*
   प्रत्येक member साठी कोणत्या financial year ची
   annual liability system ने add केली आहे हे track करण्यासाठी.
   
   हे field member मध्ये internally save होईल.
*/


/* =========================================================
   2. LOAD LOCAL STORAGE
========================================================= */

function loadSubscriptionData() {

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
   3. SAVE MEMBERS
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
   4. SAVE SUBSCRIPTIONS
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
   5. DOM ELEMENTS
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
   6. CURRENT YEAR
========================================================= */

const currentYear =
    new Date().getFullYear();


/* =========================================================
   7. FINANCIAL YEAR
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
   8. LOAD SUBSCRIPTION YEARS
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
   9. LOAD TRANSACTION YEARS
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
   10. TODAY DATE
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
   11. DEFAULT ANNUAL AMOUNT
========================================================= */

function setDefaultAnnualAmount() {

    if (annualAmount) {

        annualAmount.value =
            DEFAULT_ANNUAL_AMOUNT;

    }

}


/* =========================================================
   12. HTML ESCAPE
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
   13. JS ESCAPE
========================================================= */

function escapeSubscriptionJS(
    value
) {

    return String(
        value || ""
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
   14. GET MEMBER BY ID
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
   15. MEMBER SEARCH
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


/* =========================================================
   16. SEARCH EVENT
========================================================= */

if (
    memberSearchInput
) {

    memberSearchInput.addEventListener(
        "input",
        searchSubscriptionMembers
    );

}


/* =========================================================
   17. SELECT MEMBER
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

    updateMemberSubscriptionSummary();

    updatePendingAmount();

}


/* =========================================================
   18. GET MEMBER IMPORTED PENDING
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
   19. GET MEMBER PAYMENTS
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
   20. GET YEAR PAYMENT
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
   21. CHECK YEAR PAYMENT
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
   22. YEAR LIABILITY STATUS
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


    if (!year) {

        return;

    }


    const alreadyPaid =
        hasMemberYearPayment(
            selectedMember.id,
            year
        );


    /*
       Existing year payment असेल तर
       पुन्हा automatic ₹200 add करू नये.
    */

    const info =
        document.getElementById(
            "subscriptionYearStatus"
        );


    if (!info) {

        return;

    }


    if (alreadyPaid) {

        info.innerHTML = `

            <span style="color:green;">

                ✅ ${escapeSubscriptionHTML(
                    year
                )}
                या वर्षासाठी payment नोंद उपलब्ध आहे.

            </span>

        `;

    }
    else {

        info.innerHTML = `

            <span>

                ℹ️ ${escapeSubscriptionHTML(
                    year
                )}
                या वर्षाची वार्षिक वर्गणी:
                ₹${DEFAULT_ANNUAL_AMOUNT}

            </span>

        `;

    }

}


/* =========================================================
   23. CALCULATE CURRENT PENDING
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


    /*
       IMPORTANT:

       subscriptionPending मध्ये already
       current outstanding balance आहे.

       त्यामुळे payment करण्यापूर्वी
       हाच amount base म्हणून वापरायचा.
    */

    const pending =
        getImportedMemberPending(
            selectedMember
        );


    return Math.max(
        0,
        pending
    );

}


/* =========================================================
   24. UPDATE PENDING DISPLAY
========================================================= */

function updatePendingAmount() {

    if (!pendingAmount) {

        return;

    }


    const currentPending =
        calculateCurrentPending();


    const amount =
        Number(
            paidAmount
            ?
            paidAmount.value
            :
            0
        );


    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        pendingAmount.value =
            currentPending;

        return;

    }


    pendingAmount.value =
        Math.max(
            0,
            currentPending -
            amount
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
        ?
        subscriptionYear.value
        :
        "";


    if (!year) {

        summary.innerHTML = `

            <div class="subscription-summary">

                <strong>
                    ${escapeSubscriptionHTML(
                        selectedMember.name
                    )}
                </strong>

                <div>
                    सध्याची एकूण बाकी:
                    <strong>
                        ₹${currentPending}
                    </strong>
                </div>

            </div>

        `;

        return;

    }


    const yearPaid =
        getMemberYearPayment(
            selectedMember.id,
            year
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
                या वर्षी भरलेली:
                ₹${yearPaid}
            </div>

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
   26. YEAR CHANGE
========================================================= */

if (
    subscriptionYear
) {

    subscriptionYear.addEventListener(
        "change",
        function() {

            updateSubscriptionYearStatus();

            updateMemberSubscriptionSummary();

            updatePendingAmount();

        }
    );

}


/* =========================================================
   27. PAYMENT INPUT CHANGE
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
   28. GENERATE RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

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
   29. REDUCE MEMBER PENDING
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
                amount
            )
        );


    saveMembers();


    if (
        selectedMember &&
        String(
            selectedMember.id
        ) ===
        String(
            memberId
        )
    ) {

        selectedMember =
            members[index];

    }


    return true;

}


/* =========================================================
   30. RESTORE MEMBER PENDING
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
   31. FORM SUBMIT
========================================================= */

if (
    subscriptionForm
) {

    subscriptionForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            loadSubscriptionData();


            /* =========================================
               MEMBER
            ========================================= */

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


            /*
               Latest member data.
            */

            const latestMember =
                findMemberById(
                    selectedMember.id
                );


            if (latestMember) {

                selectedMember =
                    latestMember;

            }


            /* =========================================
               YEAR
            ========================================= */

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


            /* =========================================
               PAYMENT MODE
            ========================================= */

            if (
                paymentMode &&
                !paymentMode.value
            ) {

                alert(
                    "कृपया पेमेंट पद्धत निवडा."
                );

                return;

            }


            /* =========================================
               PAYMENT DATE
            ========================================= */

            if (
                paymentDate &&
                !paymentDate.value
            ) {

                alert(
                    "कृपया पेमेंट तारीख निवडा."
                );

                return;

            }


            /* =========================================
               PAYMENT AMOUNT
            ========================================= */

            const amount =
                Number(
                    paidAmount
                    ?
                    paidAmount.value
                    :
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


            /* =========================================
               CURRENT PENDING
            ========================================= */

            const currentPending =
                calculateCurrentPending();


            /*
               IMPORTANT:

               ₹0 pending असल्यास नवीन financial year
               साठी ₹200 payment करण्याची परवानगी.

               पण जुनी pending असल्यास
               त्या pending पेक्षा जास्त payment नाही.
            */

            const yearAlreadyPaid =
                hasMemberYearPayment(
                    selectedMember.id,
                    year
                );


            let maximumAllowed =
                currentPending;


            if (
                currentPending === 0 &&
                !yearAlreadyPaid
            ) {

                maximumAllowed =
                    DEFAULT_ANNUAL_AMOUNT;

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


            /* =========================================
               RECEIPT
            ========================================= */

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


            /* =========================================
               DUPLICATE RECEIPT
            ========================================= */

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


            /* =========================================
               NEW PENDING
            ========================================= */

            let newPending = 0;


            if (
                currentPending > 0
            ) {

                /*
                   Existing pending कमी करणे.
                */

                newPending =
                    Math.max(
                        0,
                        currentPending -
                        amount
                    );

            }
            else {

                /*
                   नवीन वर्षाची ₹200 liability.
                */

                newPending =
                    Math.max(
                        0,
                        DEFAULT_ANNUAL_AMOUNT -
                        amount
                    );

            }


            /* =========================================
               CREATE TRANSACTION
            ========================================= */

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
                    DEFAULT_ANNUAL_AMOUNT,

                paidAmount:
                    amount,

                pendingAmount:
                    newPending,

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
                    new Date()
                        .toISOString()

            };


            /* =========================================
               SAVE TRANSACTION FIRST
            ========================================= */

            subscriptions.push(
                transaction
            );


            if (
                !saveSubscriptions()
            ) {

                /*
                   Save fail झाल्यास transaction
                   memory मधून remove करा.
                */

                subscriptions.pop();

                return;

            }


            /* =========================================
               UPDATE MEMBER PENDING
            ========================================= */

            if (
                currentPending > 0
            ) {

                reduceMemberPending(
                    selectedMember.id,
                    amount
                );

            }
            else {

                /*
                   नवीन year:
                   ₹200 liability मधून payment
                   बाकी member मध्ये save करा.
                */

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


            /* =========================================
               SUCCESS
            ========================================= */

            showSubscriptionToast(
                "वर्गणी यशस्वीरित्या जतन झाली."
            );


            loadSubscriptionData();

            loadTransactionYears();

            displaySubscriptionTransactions();

            updateSubscriptionDashboard();

            resetSubscriptionForm();

        }
    );

}


/* =========================================================
   32. RESET FORM
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

}


/* =========================================================
   33. TOAST
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
        function() {

            toast.style.display =
                "none";

        },
        2500
    );

}


/* =========================================================
   34. DISPLAY TRANSACTIONS
========================================================= */

function displaySubscriptionTransactions(
    filterYear = ""
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
        [
            ...subscriptions
        ];


    if (filterYear) {

        data =
            data.filter(
                function(item) {

                    return (
                        item.year ===
                        filterYear
                    );

                }
            );

    }


    data.reverse();


    if (
        data.length === 0
    ) {

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
        function(
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
   35. TRANSACTION YEAR FILTER
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

            displaySubscriptionTransactions(
                this.value
            );

        }
    );

}


/* =========================================================
   36. DELETE SUBSCRIPTION
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
       Transaction remove.
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
       Payment पुन्हा pending मध्ये add करा.
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


    showSubscriptionToast(
        "वर्गणी नोंद Delete झाली आणि बाकी पुन्हा update झाली."
    );

}


/* =========================================================
   37. DASHBOARD UPDATE
========================================================= */

function updateSubscriptionDashboard() {

    loadSubscriptionData();


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


    /* CURRENT FINANCIAL YEAR */

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


    /* TODAY COLLECTION */

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
            function(item) {

                return (
                    item.paymentDate ===
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
   38. CLOSE SEARCH OUTSIDE
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
   39. PAGE INITIALIZATION
========================================================= */

function initializeSubscriptionPage() {

    loadSubscriptionData();

    loadSubscriptionYears();

    loadTransactionYears();

    setTodayDate();

    setDefaultAnnualAmount();

    displaySubscriptionTransactions();

    updateSubscriptionDashboard();


    if (
        pendingAmount
    ) {

        pendingAmount.value =
            "";

    }

}


/* =========================================================
   40. DOM READY
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
    "MGVM Corrected Final subscription.js loaded successfully."
);
