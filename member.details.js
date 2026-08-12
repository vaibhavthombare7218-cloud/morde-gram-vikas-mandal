/* =========================================================
   member-details.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   सभासद Details Page

   Features:
   ✅ Member Search
   ✅ Member Name / ID / Mobile Search
   ✅ Member Details View
   ✅ Pending Subscription
   ✅ 2026 पासून जमा वर्गणी
   ✅ 2026 पासून जमा देणगी
   ✅ Edit / Delete नाही
   ✅ Existing LocalStorage data compatible
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const DETAILS_YEAR = 2026;


/* =========================================================
   DOM
========================================================= */

const searchInput = document.getElementById("memberSearch");
const searchResults = document.getElementById("searchResults");
const clearSearch = document.getElementById("clearSearch");

const emptyState = document.getElementById("emptyState");
const memberDetails = document.getElementById("memberDetails");


/* =========================================================
   HELPER
========================================================= */

function clean(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}


function normalize(value) {

    return clean(value)
        .toLowerCase()
        .replace(/\s+/g, "");
}


function money(value) {

    let amount = Number(value);

    if (!Number.isFinite(amount)) {
        amount = 0;
    }

    return "₹" + amount.toLocaleString("en-IN");
}


/* =========================================================
   LOCAL STORAGE READ
========================================================= */

function readStorage(key) {

    try {

        const value = localStorage.getItem(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);

    } catch (error) {

        console.warn("Storage read error:", key, error);

        return null;
    }
}


/* =========================================================
   FIND STORAGE DATA
========================================================= */

function findStorageArray(possibleKeys) {

    for (const key of possibleKeys) {

        const data = readStorage(key);

        if (Array.isArray(data)) {
            return data;
        }

    }

    return [];
}


/* =========================================================
   MEMBERS
========================================================= */

function getMembers() {

    const possibleKeys = [

        "members",
        "mgvmMembers",
        "memberList",
        "membersData",
        "MGVM_members",
        "MGVM_Members",
        "sabhasad",
        "sabhasadData"

    ];

    let members = findStorageArray(possibleKeys);

    /*
       जर data object मध्ये members array असेल
    */

    if (!members.length) {

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            const data = readStorage(key);

            if (
                Array.isArray(data) &&
                data.length &&
                typeof data[0] === "object"
            ) {

                const first = data[0];

                const hasMemberField =
                    first.name !== undefined ||
                    first.memberName !== undefined ||
                    first.sabhasadName !== undefined ||
                    first.memberId !== undefined ||
                    first.memberID !== undefined;

                if (hasMemberField) {

                    members = data;

                    break;
                }
            }
        }
    }

    return members;
}


/* =========================================================
   MEMBER FIELD HELPERS
========================================================= */

function getMemberName(member) {

    return clean(
        member.name ??
        member.memberName ??
        member.sabhasadName ??
        member.fullName ??
        member.navn ??
        member["सभासद नाव"] ??
        member["सभासद नाव"] ??
        member["नाव"]
    );
}


function getMemberId(member) {

    return clean(
        member.memberId ??
        member.memberID ??
        member.id ??
        member.member_id ??
        member.memberCode ??
        member.mgvmId ??
        member["Member ID"] ??
        member["Member Id"] ??
        member["सभासद ID"] ??
        member["ID"]
    );
}


function getMemberWadi(member) {

    return clean(
        member.wadi ??
        member.ward ??
        member.wadiName ??
        member["वाडी"] ??
        member["Wadi"]
    );
}


function getMemberMobile(member) {

    return clean(
        member.mobile ??
        member.mobileNumber ??
        member.phone ??
        member.contact ??
        member.contactNumber ??
        member["मोबाईल"] ??
        member["Mobile"]
    );
}


function getMemberAddress(member) {

    return clean(
        member.address ??
        member.fullAddress ??
        member.addr ??
        member["पत्ता"] ??
        member["Address"]
    );
}


/* =========================================================
   PENDING SUBSCRIPTION
========================================================= */

function getPendingSubscription(member) {

    const value =
        member.subscriptionPending ??
        member.pendingSubscription ??
        member.pendingAmount ??
        member.subscriptionDue ??
        member.bakiVargani ??
        member.bakiSubscription ??
        member["बाकी वर्गणी"] ??
        0;

    const amount = Number(value);

    return Number.isFinite(amount) ? amount : 0;
}


/* =========================================================
   DATE PARSER
========================================================= */

function parseDate(value) {

    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    const text = clean(value);

    /*
       yyyy-mm-dd
    */

    let match = text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

    if (match) {

        const d = new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );

        return isNaN(d.getTime()) ? null : d;
    }


    /*
       dd/mm/yyyy
       dd-mm-yyyy
    */

    match = text.match(
        /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
    );

    if (match) {

        const d = new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
        );

        return isNaN(d.getTime()) ? null : d;
    }


    /*
       Excel / ISO date
    */

    const d = new Date(text);

    if (!isNaN(d.getTime())) {
        return d;
    }

    return null;
}


/* =========================================================
   TRANSACTION DATE
========================================================= */

function getTransactionDate(transaction) {

    return (
        transaction.date ??
        transaction.paymentDate ??
        transaction.transactionDate ??
        transaction.receiptDate ??
        transaction.createdAt ??
        transaction["तारीख"] ??
        transaction["Payment Date"] ??
        transaction["Date"]
    );
}


/* =========================================================
   TRANSACTION AMOUNT
========================================================= */

function getTransactionAmount(transaction) {

    const possibleValues = [

        transaction.amount,
        transaction.paidAmount,
        transaction.paymentAmount,
        transaction.receivedAmount,
        transaction.rakkam,
        transaction["रक्कम"],
        transaction["Amount"],
        transaction["Payment Amount"]

    ];

    for (const value of possibleValues) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number = Number(
                String(value)
                    .replace(/₹/g, "")
                    .replace(/,/g, "")
                    .trim()
            );

            if (Number.isFinite(number)) {
                return number;
            }
        }
    }

    return 0;
}


/* =========================================================
   TRANSACTION MEMBER MATCH
========================================================= */

function transactionBelongsToMember(transaction, member) {

    const memberId = normalize(getMemberId(member));
    const memberName = normalize(getMemberName(member));
    const memberMobile = normalize(getMemberMobile(member));


    const transactionId = normalize(
        transaction.memberId ??
        transaction.memberID ??
        transaction.member_id ??
        transaction["Member ID"] ??
        transaction["Member Id"] ??
        transaction["सभासद ID"] ??
        transaction["ID"]
    );


    const transactionName = normalize(
        transaction.memberName ??
        transaction.sabhasadName ??
        transaction.name ??
        transaction.donorName ??
        transaction["सभासद नाव"] ??
        transaction["सभासद नाव"] ??
        transaction["नाव"]
    );


    const transactionMobile = normalize(
        transaction.mobile ??
        transaction.mobileNumber ??
        transaction.phone ??
        transaction["Mobile"] ??
        transaction["मोबाईल"]
    );


    /*
       सर्वात आधी Member ID match
    */

    if (
        memberId &&
        transactionId &&
        memberId === transactionId
    ) {
        return true;
    }


    /*
       Member ID उपलब्ध नसेल तर Name + Mobile
    */

    if (
        memberName &&
        transactionName &&
        memberName === transactionName
    ) {

        if (!memberMobile || !transactionMobile) {
            return true;
        }

        return memberMobile === transactionMobile;
    }


    return false;
}


/* =========================================================
   GET ALL TRANSACTIONS
========================================================= */

function getAllTransactionArrays(possibleKeys) {

    const output = [];

    for (const key of possibleKeys) {

        const data = readStorage(key);

        if (Array.isArray(data)) {

            output.push(...data);
        }
    }

    /*
       Duplicate transactions remove करण्यासाठी
    */

    const seen = new Set();

    return output.filter((item, index) => {

        const signature = JSON.stringify(item);

        if (seen.has(signature)) {
            return false;
        }

        seen.add(signature);

        return true;
    });
}


/* =========================================================
   SUBSCRIPTION TRANSACTIONS
========================================================= */

function getSubscriptionTransactions() {

    return getAllTransactionArrays([

        "subscriptions",
        "subscriptionData",
        "subscriptionTransactions",
        "subscriptionRecords",
        "vargani",
        "varganiData",
        "varganiTransactions",
        "MGVM_subscriptions",
        "MGVM_Subscriptions"

    ]);
}


/* =========================================================
   DONATION TRANSACTIONS
========================================================= */

function getDonationTransactions() {

    return getAllTransactionArrays([

        "donations",
        "donationData",
        "donationTransactions",
        "donationRecords",
        "denagi",
        "denagiData",
        "denagiTransactions",
        "MGVM_donations",
        "MGVM_Donations"

    ]);
}


/* =========================================================
   2026 SUBSCRIPTION TOTAL
========================================================= */

function calculateSubscription2026(member) {

    const transactions =
        getSubscriptionTransactions();

    const startDate =
        new Date(DETAILS_YEAR, 0, 1);

    let total = 0;


    transactions.forEach(transaction => {

        if (
            !transactionBelongsToMember(
                transaction,
                member
            )
        ) {
            return;
        }


        const dateValue =
            getTransactionDate(transaction);

        const date =
            parseDate(dateValue);

        if (!date) {
            return;
        }


        if (date >= startDate) {

            total += getTransactionAmount(
                transaction
            );
        }

    });


    return total;
}


/* =========================================================
   2026 DONATION TOTAL
========================================================= */

function calculateDonation2026(member) {

    const transactions =
        getDonationTransactions();

    const startDate =
        new Date(DETAILS_YEAR, 0, 1);

    let total = 0;


    transactions.forEach(transaction => {

        if (
            !transactionBelongsToMember(
                transaction,
                member
            )
        ) {
            return;
        }


        const dateValue =
            getTransactionDate(transaction);

        const date =
            parseDate(dateValue);

        if (!date) {
            return;
        }


        if (date >= startDate) {

            total += getTransactionAmount(
                transaction
            );
        }

    });


    return total;
}


/* =========================================================
   SEARCH
========================================================= */

function searchMembers(query) {

    const members = getMembers();

    const text = normalize(query);

    if (!text) {
        return [];
    }


    return members
        .filter(member => {

            const name =
                normalize(getMemberName(member));

            const id =
                normalize(getMemberId(member));

            const mobile =
                normalize(getMemberMobile(member));

            const wadi =
                normalize(getMemberWadi(member));


            return (
                name.includes(text) ||
                id.includes(text) ||
                mobile.includes(text) ||
                wadi.includes(text)
            );

        })
        .slice(0, 30);
}


/* =========================================================
   SHOW SEARCH RESULTS
========================================================= */

function showSearchResults(results) {

    searchResults.innerHTML = "";


    if (!results.length) {

        searchResults.innerHTML = `
            <div class="search-result">
                <div>
                    <div class="result-name">
                        सभासद सापडला नाही
                    </div>
                    <div class="result-info">
                        नाव / ID / Mobile तपासा.
                    </div>
                </div>
            </div>
        `;

        searchResults.style.display = "block";

        return;
    }


    results.forEach(member => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "search-result";


        const name =
            getMemberName(member) || "नाव नाही";

        const id =
            getMemberId(member) || "-";

        const wadi =
            getMemberWadi(member) || "-";

        const mobile =
            getMemberMobile(member) || "-";


        button.innerHTML = `

            <div>

                <div class="result-name">
                    ${escapeHtml(name)}
                </div>

                <div class="result-info">
                    ID: ${escapeHtml(id)}
                    &nbsp; | &nbsp;
                    वाडी: ${escapeHtml(wadi)}
                </div>

            </div>

            <div class="result-info">
                ${escapeHtml(mobile)}
            </div>

        `;


        button.addEventListener(
            "click",
            () => {

                selectMember(member);

                searchResults.style.display =
                    "none";

                searchInput.value =
                    getMemberName(member);

            }
        );


        searchResults.appendChild(button);

    });


    searchResults.style.display = "block";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   SELECT MEMBER
========================================================= */

function selectMember(member) {

    const name =
        getMemberName(member) || "-";

    const id =
        getMemberId(member) || "-";

    const wadi =
        getMemberWadi(member) || "-";

    const mobile =
        getMemberMobile(member) || "-";

    const address =
        getMemberAddress(member) || "-";


    const pending =
        getPendingSubscription(member);

    const subscription2026 =
        calculateSubscription2026(member);

    const donation2026 =
        calculateDonation2026(member);


    /*
       Profile
    */

    document.getElementById(
        "memberName"
    ).textContent = name;

    document.getElementById(
        "memberId"
    ).textContent = id;

    document.getElementById(
        "memberWadi"
    ).textContent = wadi;


    /*
       Details
    */

    document.getElementById(
        "detailName"
    ).textContent = name;

    document.getElementById(
        "detailId"
    ).textContent = id;

    document.getElementById(
        "detailWadi"
    ).textContent = wadi;

    document.getElementById(
        "detailMobile"
    ).textContent = mobile;

    document.getElementById(
        "detailAddress"
    ).textContent = address;


    /*
       Financial
    */

    document.getElementById(
        "pendingSubscription"
    ).textContent = money(pending);


    document.getElementById(
        "subscription2026"
    ).textContent = money(
        subscription2026
    );


    document.getElementById(
        "donation2026"
    ).textContent = money(
        donation2026
    );


    /*
       Show details
    */

    emptyState.classList.add("hidden");

    memberDetails.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SEARCH EVENT
========================================================= */

searchInput.addEventListener(
    "input",
    function () {

        const query =
            this.value.trim();


        if (!query) {

            searchResults.innerHTML = "";

            searchResults.style.display =
                "none";

            return;
        }


        const results =
            searchMembers(query);

        showSearchResults(results);
    }
);


/* =========================================================
   CLEAR
========================================================= */

clearSearch.addEventListener(
    "click",
    function () {

        searchInput.value = "";

        searchResults.innerHTML = "";

        searchResults.style.display =
            "none";

        memberDetails.classList.add(
            "hidden"
        );

        emptyState.classList.remove(
            "hidden"
        );

        searchInput.focus();
    }
);


/* =========================================================
   CLOSE SEARCH WHEN CLICK OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".search-card"
            )
        ) {

            searchResults.style.display =
                "none";
        }

    }
);


/* =========================================================
   INITIAL CHECK
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const members = getMembers();

        console.log(
            "Member Details loaded."
        );

        console.log(
            "Members found:",
            members.length
        );

        console.log(
            "Subscription transactions:",
            getSubscriptionTransactions().length
        );

        console.log(
            "Donation transactions:",
            getDonationTransactions().length
        );

    }
);
