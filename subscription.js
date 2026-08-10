/* =========================================================
   subscription.js
   CORRECTED FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   IMPORTANT FIX:
   ✅ Member Search logic सुरक्षित ठेवली आहे
   ✅ Excel मधील subscriptionPending consider होईल
   ✅ Excel मध्ये ₹1500 बाकी असेल तर Subscription मध्ये ₹1500
   ✅ ₹200 payment केल्यावर बाकी ₹1300
   ✅ Partial Payment supported
   ✅ Delete केल्यावर बाकी पुन्हा योग्य होईल
   ✅ Existing subscription transactions सुरक्षित
   ========================================================= */


/* =========================================================
   1. GLOBAL DATA
========================================================= */

let members = [];

let subscriptions = [];

let selectedMember = null;

const DEFAULT_ANNUAL_AMOUNT = 200;


/* =========================================================
   2. LOAD LOCAL STORAGE
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
   3. SAVE MEMBERS
========================================================= */

function saveMembers() {

    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(
            members
        )
    );

}


/* =========================================================
   4. SAVE SUBSCRIPTIONS
========================================================= */

function saveSubscriptions() {

    localStorage.setItem(
        "mgvm_subscriptions",
        JSON.stringify(
            subscriptions
        )
    );

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
   9. LOAD TRANSACTION YEAR FILTER
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
   14. MEMBER SEARCH
   IMPORTANT:
   Existing search logic preserved.
========================================================= */

function searchSubscriptionMembers() {

    /*
       नवीन member data मिळण्यासाठी
       latest LocalStorage data load करतो.
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
   15. SEARCH EVENT
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
   16. SELECT MEMBER
========================================================= */

function selectSubscriptionMember(
    member
) {

    /*
       LocalStorage मधून latest member object
       घेण्याचा प्रयत्न.
    */

    const latestMember =
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


    updateMemberSubscriptionSummary();

    updatePendingAmount();

}


/* =========================================================
   17. FIND MEMBER
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
   18. GET EXCEL / MEMBER IMPORTED PENDING
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
   19. GET TOTAL PAID TRANSACTIONS
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
                    String(
                        memberId
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
   20. GET YEAR PAYMENT
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
                    String(
                        memberId
                    ) &&

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
   21. GET CURRENT MEMBER PENDING
   MAIN FIX
========================================================= */

function getCurrentMemberPending() {

    if (!selectedMember) {

        return 0;

    }


    /*
       selectedMember मध्ये Excel import केलेली
       subscriptionPending value घेतली जाते.
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
   22. CALCULATE PAYMENT PENDING
========================================================= */

function calculatePendingAmount() {

    if (!selectedMember) {

        return 0;

    }


    /*
       IMPORTANT:
       Excel मधील बाकी रक्कम वापरली जाते.

       उदाहरण:
       Excel pending = 1500
       Paid Now = 200

       Result = 1300
    */

    const currentPending =
        getCurrentMemberPending();


    const paidNow =
        Number(
            paidAmount
            ?
            paidAmount.value
            :
            0
        );


    if (
        !Number.isFinite(
            paidNow
        )
    ) {

        return currentPending;

    }


    return Math.max(
        0,
        currentPending -
        paidNow
    );

}


/* =========================================================
   23. UPDATE PENDING
========================================================= */

function updatePendingAmount() {

    if (!pendingAmount) {

        return;

    }


    pendingAmount.value =
        calculatePendingAmount();

}


/* =========================================================
   24. MEMBER SUBSCRIPTION SUMMARY
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


    const year =
        subscriptionYear
        ?
        subscriptionYear.value
        :
        "";


    const importedPending =
        getCurrentMemberPending();


    const yearPaid =
        year
        ?
        getMemberYearPayment(
            selectedMember.id,
            year
        )
        :
        0;


    if (!year) {

        summary.innerHTML = `

            <div class="subscription-summary">

                <strong>
                    ${escapeSubscriptionHTML(
                        selectedMember.name
                    )}
                </strong>

                <div>
                    Excel/Member मध्ये नोंद असलेली
                    एकूण बाकी:
                    <strong>
                        ₹${importedPending}
                    </strong>
                </div>

            </div>

        `;

        return;

    }


    const paymentPending =
        Math.max(
            0,
            importedPending
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
                <strong>
                    एकूण बाकी:
                    ₹${paymentPending}
                </strong>
            </div>

        </div>

    `;

}


/* =========================================================
   25. YEAR CHANGE
========================================================= */

if (
    subscriptionYear
) {

    subscriptionYear.addEventListener(
        "change",
        function() {

            updatePendingAmount();

            updateMemberSubscriptionSummary();

        }
    );

}


/* =========================================================
   26. PAID AMOUNT CHANGE
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
   27. GENERATE RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

    let maxNumber = 0;


    subscriptions.forEach(
        function(item) {

            if (
                !item.receiptNo
            ) {

                return;

            }


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
        )
        .padStart(
            4,
            "0"
        )
    );

}


/* =========================================================
   28. UPDATE MEMBER PENDING AFTER PAYMENT
   MAIN FIX
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

        return;

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


    /*
       selectedMember सुद्धा update करा.
       त्यामुळे लगेच UI मध्ये नवीन pending दिसेल.
    */

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

}


/* =========================================================
   29. ADD MEMBER PENDING AFTER DELETE
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

        return;

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

}


/* =========================================================
   30. FORM SUBMIT
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
               Latest member data पुन्हा घ्या.
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
                getCurrentMemberPending();


            /*
               Excel pending / current member pending
               पेक्षा जास्त payment करू देऊ नका.
            */

            if (
                amount >
                currentPending
            ) {

                alert(
                    "या सभासदाची सध्याची बाकी ₹" +
                    currentPending +
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
                                item.receiptNo
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

            const newPending =
                Math.max(
                    0,
                    currentPending -
                    amount
                );


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
               SAVE TRANSACTION
            ========================================= */

            subscriptions.push(
                transaction
            );


            saveSubscriptions();


            /* =========================================
               UPDATE MEMBER PENDING
            ========================================= */

            reduceMemberPending(
                selectedMember.id,
                amount
            );


            /* =========================================
               SUCCESS
            ========================================= */

            showSubscriptionToast(
                "वर्गणी यशस्वीरित्या जतन झाली."
            );


            loadSubscriptionData();

            loadTransactionYears();

            displaySubscriptionTransactions();


            resetSubscriptionForm();

        }
    );

}


/* =========================================================
   31. RESET FORM
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

    if (pendingAmount) {

        pendingAmount.value =
            "";

    }

}


/* =========================================================
   32. TOAST
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
   33. DISPLAY TRANSACTIONS
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
   34. YEAR FILTER
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
   35. DELETE SUBSCRIPTION
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
       Delete केलेली payment amount
       member pending मध्ये परत add करा.
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


    showSubscriptionToast(
        "वर्गणी नोंद Delete झाली."
    );

}


/* =========================================================
   36. DASHBOARD UPDATE
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
            totalSubscription;

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
            yearTotal;

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
            todayTotal;

    }

}


/* =========================================================
   37. CLOSE SEARCH OUTSIDE
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
   38. PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadSubscriptionData();

        loadSubscriptionYears();

        loadTransactionYears();

        setTodayDate();

        setDefaultAnnualAmount();

        displaySubscriptionTransactions();

        updateSubscriptionDashboard();

        if (pendingAmount) {

            pendingAmount.value =
                "";

        }

    }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM Corrected subscription.js loaded successfully."
);
