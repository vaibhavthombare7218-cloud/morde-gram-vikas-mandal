/* =========================================================
   member-details.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   CORRECTED VERSION

   MAIN DATABASE:
   mgvm_members

   Compatibility:
   members

   Supports:
   ✅ member.memberId
   ✅ member.id
   ✅ Subscription
   ✅ Donation
   ✅ Pending Subscription
   ✅ 2026 Subscription
   ✅ 2026 Donation
   ✅ Search
   ✅ Member Details
========================================================= */


/* =========================================================
   DATABASE KEYS
========================================================= */

const MEMBERS_KEY =
    "mgvm_members";

const SUBSCRIPTIONS_KEY =
    "mgvm_subscriptions";

const DONATIONS_KEY =
    "mgvm_donations";


/* =========================================================
   GET MEMBERS
========================================================= */

function getMembers() {

    try {

        let data =
            localStorage.getItem(
                MEMBERS_KEY
            );


        /*
           Old project compatibility
        */

        if (!data) {

            data =
                localStorage.getItem(
                    "members"
                );

        }


        const result =
            JSON.parse(
                data || "[]"
            );


        return Array.isArray(result)
            ? result
            : [];

    }
    catch (error) {

        console.error(
            "Members Load Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   GET SUBSCRIPTIONS
========================================================= */

function getSubscriptions() {

    try {

        const data =
            localStorage.getItem(
                SUBSCRIPTIONS_KEY
            );


        const result =
            JSON.parse(
                data || "[]"
            );


        return Array.isArray(result)
            ? result
            : [];

    }
    catch (error) {

        console.error(
            "Subscription Load Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   GET DONATIONS
========================================================= */

function getDonations() {

    try {

        const data =
            localStorage.getItem(
                DONATIONS_KEY
            );


        const result =
            JSON.parse(
                data || "[]"
            );


        return Array.isArray(result)
            ? result
            : [];

    }
    catch (error) {

        console.error(
            "Donation Load Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   GET MEMBER ID

   IMPORTANT:
   New system:
   member.memberId

   Old system:
   member.id

========================================================= */

function getMemberId(member) {

    return String(
        member.memberId ||
        member.id ||
        ""
    ).trim();

}


/* =========================================================
   GET MEMBER NAME
========================================================= */

function getMemberName(member) {

    return String(
        member.name ||
        member.memberName ||
        ""
    ).trim();

}


/* =========================================================
   GET MEMBER MOBILE
========================================================= */

function getMemberMobile(member) {

    return String(
        member.mobile ||
        member.phone ||
        ""
    ).trim();

}


/* =========================================================
   GET MEMBER WADI
========================================================= */

function getMemberWadi(member) {

    return String(
        member.wadi ||
        ""
    ).trim();

}


/* =========================================================
   GET PENDING SUBSCRIPTION
========================================================= */

function getPendingSubscription(member) {

    const pending =
        Number(
            member.subscriptionPending
        );


    if (
        Number.isFinite(
            pending
        )
    ) {

        return Math.max(
            0,
            pending
        );

    }


    /*
       Compatibility with possible
       old pending field
    */

    const oldPending =
        Number(
            member.pendingSubscription
        );


    if (
        Number.isFinite(
            oldPending
        )
    ) {

        return Math.max(
            0,
            oldPending
        );

    }


    return 0;

}


/* =========================================================
   FIND MEMBER TRANSACTIONS
========================================================= */

function memberIdMatch(
    transactionMemberId,
    member
) {

    const transactionId =
        String(
            transactionMemberId ||
            ""
        ).trim().toLowerCase();


    const id =
        getMemberId(member)
        .toLowerCase();


    return (
        transactionId !== "" &&
        id !== "" &&
        transactionId === id
    );

}


/* =========================================================
   GET MEMBER SUBSCRIPTIONS
========================================================= */

function getMemberSubscriptions(
    member
) {

    const subscriptions =
        getSubscriptions();


    return subscriptions.filter(
        function(item) {

            return memberIdMatch(
                item.memberId,
                member
            );

        }
    );

}


/* =========================================================
   GET MEMBER DONATIONS
========================================================= */

function getMemberDonations(
    member
) {

    const donations =
        getDonations();


    return donations.filter(
        function(item) {

            return memberIdMatch(
                item.memberId,
                member
            );

        }
    );

}


/* =========================================================
   2026 SUBSCRIPTION TOTAL
========================================================= */

function get2026SubscriptionTotal(
    member
) {

    const list =
        getMemberSubscriptions(
            member
        );


    return list
        .filter(
            function(item) {

                const date =
                    String(
                        item.paymentDate ||
                        item.createdAt ||
                        ""
                    );


                /*
                   2026 पासून म्हणजे
                   01/01/2026 नंतरचे
                   payment
                */

                return date.startsWith(
                    "2026"
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
   2026 DONATION TOTAL
========================================================= */

function get2026DonationTotal(
    member
) {

    const list =
        getMemberDonations(
            member
        );


    return list
        .filter(
            function(item) {

                const date =
                    String(
                        item.donationDate ||
                        item.createdAt ||
                        ""
                    );


                return date.startsWith(
                    "2026"
                );

            }
        )
        .reduce(
            function(total, item) {

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
   FORMAT NUMBER
========================================================= */

function formatNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const value =
        String(
            dateString
        );


    /*
       YYYY-MM-DD
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        const parts =
            value.split("-");


        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return value;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
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
   LOAD MEMBERS
========================================================= */

function loadMemberDetails() {

    const members =
        getMembers();


    const tbody =
        document.getElementById(
            "memberTableBody"
        );


    const countElement =
        document.getElementById(
            "memberCount"
        );


    if (!tbody) {

        return;

    }


    /*
       IMPORTANT:
       Total members = actual members
    */

    if (countElement) {

        countElement.textContent =
            members.length;

    }


    const searchInput =
        document.getElementById(
            "memberSearch"
        );


    const keyword =
        searchInput
        ?
        searchInput.value
            .trim()
            .toLowerCase()
        :
        "";


    let filteredMembers =
        members;


    /* =====================================================
       SEARCH
    ===================================================== */

    if (keyword) {

        filteredMembers =
            members.filter(
                function(member) {

                    const id =
                        getMemberId(
                            member
                        )
                        .toLowerCase();


                    const name =
                        getMemberName(
                            member
                        )
                        .toLowerCase();


                    const mobile =
                        getMemberMobile(
                            member
                        )
                        .toLowerCase();


                    const wadi =
                        getMemberWadi(
                            member
                        )
                        .toLowerCase();


                    return (

                        id.includes(
                            keyword
                        )

                        ||

                        name.includes(
                            keyword
                        )

                        ||

                        mobile.includes(
                            keyword
                        )

                        ||

                        wadi.includes(
                            keyword
                        )

                    );

                }
            );

    }


    /*
       Search status
    */

    const searchStatus =
        document.getElementById(
            "searchStatus"
        );


    if (searchStatus) {

        if (keyword) {

            searchStatus.textContent =
                "शोध परिणाम: " +
                filteredMembers.length;

        }
        else {

            searchStatus.textContent =
                "सर्व सभासद";

        }

    }


    tbody.innerHTML =
        "";


    /* =====================================================
       NO DATA
    ===================================================== */

    if (
        filteredMembers.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="text-align:center;padding:25px;"
                >

                    ${
                        members.length === 0
                        ?
                        "सभासद data उपलब्ध नाही."
                        :
                        "शोधानुसार सभासद सापडला नाही."
                    }

                </td>

            </tr>

        `;

        return;

    }


    /* =====================================================
       DISPLAY MEMBERS
    ===================================================== */

    filteredMembers.forEach(
        function(
            member,
            index
        ) {

            const memberId =
                getMemberId(
                    member
                );


            const name =
                getMemberName(
                    member
                );


            const wadi =
                getMemberWadi(
                    member
                );


            const mobile =
                getMemberMobile(
                    member
                );


            const pending =
                getPendingSubscription(
                    member
                );


            const subscription2026 =
                get2026SubscriptionTotal(
                    member
                );


            const donation2026 =
                get2026DonationTotal(
                    member
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    <strong>
                        ${escapeHtml(
                            name
                        )}
                    </strong>
                </td>


                <td>
                    ${escapeHtml(
                        memberId || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        wadi || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        mobile || "-"
                    )}
                </td>


                <td>
                    <strong>
                        ₹${formatNumber(
                            pending
                        )}
                    </strong>
                </td>


                <td>
                    ₹${formatNumber(
                        subscription2026
                    )}
                </td>


                <td>
                    ₹${formatNumber(
                        donation2026
                    )}
                </td>


                <td>

                    <button
                        type="button"
                        class="btn-info"
                        data-member-id="${escapeHtml(
                            memberId
                        )}"
                    >

                        <i class="fa-solid fa-eye"></i>

                        माहिती

                    </button>

                </td>

            `;


            const infoButton =
                tr.querySelector(
                    ".btn-info"
                );


            if (infoButton) {

                infoButton.addEventListener(
                    "click",
                    function() {

                        showMemberDetails(
                            member
                        );

                    }
                );

            }


            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   SHOW MEMBER DETAILS
========================================================= */

function showMemberDetails(
    member
) {

    const modal =
        document.getElementById(
            "memberModal"
        );


    const content =
        document.getElementById(
            "memberDetailsContent"
        );


    if (
        !modal ||
        !content
    ) {

        return;

    }


    const memberId =
        getMemberId(
            member
        );


    const name =
        getMemberName(
            member
        );


    const mobile =
        getMemberMobile(
            member
        );


    const wadi =
        getMemberWadi(
            member
        );


    const pending =
        getPendingSubscription(
            member
        );


    const subscriptions =
        getMemberSubscriptions(
            member
        );


    const donations =
        getMemberDonations(
            member
        );


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


    const totalDonation =
        donations.reduce(
            function(total, item) {

                return (
                    total +
                    Number(
                        item.amount || 0
                    )
                );

            },
            0
        );


    const subscription2026 =
        get2026SubscriptionTotal(
            member
        );


    const donation2026 =
        get2026DonationTotal(
            member
        );


    content.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">

                <span>सभासद ID</span>

                <strong>
                    ${escapeHtml(
                        memberId || "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>सभासद नाव</span>

                <strong>
                    ${escapeHtml(
                        name || "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>मोबाईल</span>

                <strong>
                    ${escapeHtml(
                        mobile || "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>वाडी</span>

                <strong>
                    ${escapeHtml(
                        wadi || "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>बाकी वर्गणी</span>

                <strong>
                    ₹${formatNumber(
                        pending
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>एकूण जमा वर्गणी</span>

                <strong>
                    ₹${formatNumber(
                        totalSubscription
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>2026 पासून जमा वर्गणी</span>

                <strong>
                    ₹${formatNumber(
                        subscription2026
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>एकूण देणगी</span>

                <strong>
                    ₹${formatNumber(
                        totalDonation
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>2026 पासून जमा देणगी</span>

                <strong>
                    ₹${formatNumber(
                        donation2026
                    )}
                </strong>

            </div>

        </div>


        <hr>


        <h3>
            <i class="fa-solid fa-money-bill"></i>
            वर्गणी इतिहास
        </h3>


        <div class="history-table-wrapper">

        <table class="history-table">

        <thead>

        <tr>

            <th>तारीख</th>

            <th>वर्ष</th>

            <th>रक्कम</th>

            <th>Receipt</th>

            <th>Payment Mode</th>

        </tr>

        </thead>


        <tbody>

        ${
            subscriptions.length === 0

            ?

            `
            <tr>
                <td colspan="5">
                    वर्गणी नोंद उपलब्ध नाही.
                </td>
            </tr>
            `

            :

            subscriptions
            .slice()
            .sort(
                function(a,b) {

                    return (
                        new Date(
                            b.paymentDate ||
                            b.createdAt
                        )
                        -
                        new Date(
                            a.paymentDate ||
                            a.createdAt
                        )
                    );

                }
            )
            .map(
                function(item) {

                    return `

                    <tr>

                        <td>
                            ${formatDate(
                                item.paymentDate
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.year || "-"
                            )}
                        </td>

                        <td>
                            ₹${formatNumber(
                                item.paidAmount
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.receiptNo || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.paymentMode || "-"
                            )}
                        </td>

                    </tr>

                    `;

                }
            )
            .join("")

        }

        </tbody>

        </table>

        </div>


        <br>


        <h3>
            <i class="fa-solid fa-hand-holding-heart"></i>
            देणगी इतिहास
        </h3>


        <div class="history-table-wrapper">

        <table class="history-table">

        <thead>

        <tr>

            <th>तारीख</th>

            <th>रक्कम</th>

            <th>Receipt</th>

            <th>Payment Mode</th>

        </tr>

        </thead>


        <tbody>

        ${
            donations.length === 0

            ?

            `
            <tr>
                <td colspan="4">
                    देणगी नोंद उपलब्ध नाही.
                </td>
            </tr>
            `

            :

            donations
            .slice()
            .sort(
                function(a,b) {

                    return (
                        new Date(
                            b.donationDate ||
                            b.createdAt
                        )
                        -
                        new Date(
                            a.donationDate ||
                            a.createdAt
                        )
                    );

                }
            )
            .map(
                function(item) {

                    return `

                    <tr>

                        <td>
                            ${formatDate(
                                item.donationDate
                            )}
                        </td>

                        <td>
                            ₹${formatNumber(
                                item.amount
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.receiptNo || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.paymentMode || "-"
                            )}
                        </td>

                    </tr>

                    `;

                }
            )
            .join("")

        }

        </tbody>

        </table>

        </div>

    `;


    modal.style.display =
        "flex";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeMemberModal() {

    const modal =
        document.getElementById(
            "memberModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   SEARCH EVENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        const search =
            document.getElementById(
                "memberSearch"
            );


        const clear =
            document.getElementById(
                "clearSearch"
            );


        const close =
            document.getElementById(
                "closeModal"
            );


        if (search) {

            search.addEventListener(
                "input",
                loadMemberDetails
            );

        }


        if (clear) {

            clear.addEventListener(
                "click",
                function() {

                    if (search) {

                        search.value =
                            "";

                    }

                    loadMemberDetails();

                }
            );

        }


        if (close) {

            close.addEventListener(
                "click",
                closeMemberModal
            );

        }


        const modal =
            document.getElementById(
                "memberModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeMemberModal();

                    }

                }
            );

        }


        /*
           ESC key
        */

        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeMemberModal();

                }

            }
        );


        /*
           INITIAL LOAD
        */

        loadMemberDetails();

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "MGVM Member Details loaded."
);

console.log(
    "Members:",
    getMembers().length
);

console.log(
    "Subscriptions:",
    getSubscriptions().length
);

console.log(
    "Donations:",
    getDonations().length
);
