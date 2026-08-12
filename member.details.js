/* =========================================================
   member-details.js

   मोर्डे ग्राम विकास मंडळ, मुंबई

   MEMBER DETAILS PAGE

   DATA SOURCES:

   Members:
   mgvm_members

   Subscription:
   mgvm_subscriptions

   Donation:
   mgvm_donations

   FEATURES:

   ✅ Member Details
   ✅ Name Search
   ✅ ID Search
   ✅ Mobile Search
   ✅ Wadi
   ✅ Address
   ✅ Pending Subscription
   ✅ Subscription collected from 01-01-2026
   ✅ Donation collected from 01-01-2026
   ✅ View Details
   ❌ Edit
   ❌ Delete

========================================================= */


/* =========================================================
   1. STORAGE KEYS
========================================================= */

const MEMBER_DETAILS_MEMBERS_KEY =
    "mgvm_members";

const MEMBER_DETAILS_SUBSCRIPTION_KEY =
    "mgvm_subscriptions";

const MEMBER_DETAILS_DONATION_KEY =
    "mgvm_donations";


/* =========================================================
   2. DATA
========================================================= */

let detailMembers = [];

let detailSubscriptions = [];

let detailDonations = [];


/* =========================================================
   3. 2026 START DATE
========================================================= */

const FROM_2026_DATE =
    "2026-01-01";


/* =========================================================
   4. GET LOCAL STORAGE
========================================================= */

function getLocalArray(key) {

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
            "Storage Error:",
            key,
            error
        );

        return [];

    }

}


/* =========================================================
   5. LOAD ALL DATA
========================================================= */

function loadMemberDetailsData() {

    detailMembers =
        getLocalArray(
            MEMBER_DETAILS_MEMBERS_KEY
        );


    detailSubscriptions =
        getLocalArray(
            MEMBER_DETAILS_SUBSCRIPTION_KEY
        );


    detailDonations =
        getLocalArray(
            MEMBER_DETAILS_DONATION_KEY
        );

}


/* =========================================================
   6. NORMALIZE
========================================================= */

function normalizeDetailText(
    value
) {

    return String(
        value || ""
    )
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

}


/* =========================================================
   7. ESCAPE HTML
========================================================= */

function escapeDetailHTML(
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
   8. FORMAT MONEY
========================================================= */

function formatDetailMoney(
    amount
) {

    const value =
        Number(amount || 0);


    return (
        "₹" +
        value.toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   9. GET MEMBER ID
   members.js uses member.id
========================================================= */

function getMemberId(
    member
) {

    if (!member) {

        return "";

    }


    /*
       Primary:
       members.js => id

       Compatibility:
       donation.js => memberId
    */

    return String(
        member.id ||
        member.memberId ||
        ""
    ).trim();

}


/* =========================================================
   10. GET DONATION MEMBER ID
========================================================= */

function getDonationMemberId(
    donation
) {

    if (!donation) {

        return "";

    }


    return String(
        donation.memberId ||
        donation.idMember ||
        donation.memberID ||
        ""
    ).trim();

}


/* =========================================================
   11. GET SUBSCRIPTION MEMBER ID
========================================================= */

function getSubscriptionMemberId(
    subscription
) {

    if (!subscription) {

        return "";

    }


    return String(
        subscription.memberId ||
        subscription.memberID ||
        subscription.idMember ||
        ""
    ).trim();

}


/* =========================================================
   12. DATE CHECK
========================================================= */

function isFrom2026(
    dateValue
) {

    if (!dateValue) {

        return false;

    }


    const text =
        String(
            dateValue
        ).trim();


    /*
       Main system date:
       YYYY-MM-DD

       Compare string directly to avoid
       timezone problems.
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(text)
    ) {

        return (
            text >=
            FROM_2026_DATE
        );

    }


    /*
       ISO date:
       2026-01-01T...
    */

    if (
        text.length >= 10 &&
        /^\d{4}-\d{2}-\d{2}/
            .test(text)
    ) {

        return (
            text.substring(
                0,
                10
            ) >=
            FROM_2026_DATE
        );

    }


    /*
       Other date format fallback
    */

    const date =
        new Date(text);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    const year =
        date.getFullYear();


    return year >= 2026;

}


/* =========================================================
   13. GET SUBSCRIPTION COLLECTION FROM 2026
========================================================= */

function getMemberSubscriptionFrom2026(
    member
) {

    const memberId =
        getMemberId(
            member
        );


    if (!memberId) {

        return 0;

    }


    return detailSubscriptions
        .filter(
            function(item) {

                const transactionMemberId =
                    getSubscriptionMemberId(
                        item
                    );


                if (
                    transactionMemberId !==
                    memberId
                ) {

                    return false;

                }


                /*
                   Subscription.js uses
                   paymentDate.
                */

                return isFrom2026(
                    item.paymentDate
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
   14. GET MEMBER DONATION FROM 2026
========================================================= */

function getMemberDonationFrom2026(
    member
) {

    const memberId =
        getMemberId(
            member
        );


    if (!memberId) {

        return 0;

    }


    return detailDonations
        .filter(
            function(donation) {

                const donationMemberId =
                    getDonationMemberId(
                        donation
                    );


                /*
                   Normal case:
                   donation.memberId == member.id
                */

                if (
                    donationMemberId &&
                    donationMemberId ===
                    memberId
                ) {

                    return isFrom2026(
                        donation.donationDate
                    );

                }


                /*
                   Compatibility:
                   Some old member records may
                   have donation stored inside
                   member.donations.
                   
                   Those are handled separately
                   below.
                */

                return false;

            }
        )
        .reduce(
            function(
                total,
                donation
            ) {

                return (
                    total +
                    Number(
                        donation.amount || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   15. GET MEMBER DONATION FROM EMBEDDED RECORD
   members.js / donation.js reflection
========================================================= */

function getEmbeddedMemberDonationFrom2026(
    member
) {

    if (
        !member ||
        !Array.isArray(
            member.donations
        )
    ) {

        return 0;

    }


    return member.donations
        .filter(
            function(donation) {

                return isFrom2026(
                    donation.donationDate
                );

            }
        )
        .reduce(
            function(
                total,
                donation
            ) {

                return (
                    total +
                    Number(
                        donation.amount || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   16. FINAL DONATION TOTAL
========================================================= */

function getFinalMemberDonationFrom2026(
    member
) {

    const directTotal =
        getMemberDonationFrom2026(
            member
        );


    /*
       If direct donation records are
       available, use them.

       Embedded records are fallback only.
       This prevents double counting because
       donation.js stores the same donation in
       mgvm_donations AND member.donations.
    */

    if (
        directTotal > 0
    ) {

        return directTotal;

    }


    return getEmbeddedMemberDonationFrom2026(
        member
    );

}


/* =========================================================
   17. GET MEMBER PENDING
========================================================= */

function getMemberPending(
    member
) {

    if (!member) {

        return 0;

    }


    return Math.max(
        0,
        Number(
            member.subscriptionPending
        ) || 0
    );

}


/* =========================================================
   18. GET MEMBER BY ID
========================================================= */

function findDetailMember(
    id
) {

    return detailMembers.find(
        function(member) {

            return (
                getMemberId(member) ===
                String(id)
            );

        }
    ) || null;

}


/* =========================================================
   19. DISPLAY MEMBERS
========================================================= */

function displayMemberDetailsList(
    list
) {

    const tbody =
        document.getElementById(
            "memberTableBody"
        );


    const count =
        document.getElementById(
            "memberCount"
        );


    if (!tbody) {

        return;

    }


    if (count) {

        count.innerText =
            list.length;

    }


    if (
        !list ||
        list.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="9"
                    class="empty">

                    <i class="fa-solid fa-user-slash"></i>

                    कोणताही सभासद सापडला नाही.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML = "";


    list.forEach(
        function(
            member,
            index
        ) {

            const memberId =
                getMemberId(
                    member
                );


            const pending =
                getMemberPending(
                    member
                );


            const subscription2026 =
                getMemberSubscriptionFrom2026(
                    member
                );


            const donation2026 =
                getFinalMemberDonationFrom2026(
                    member
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>

                    <strong>
                        ${escapeDetailHTML(
                            member.name
                        )}
                    </strong>

                </td>

                <td>
                    ${escapeDetailHTML(
                        memberId
                    )}
                </td>

                <td>
                    ${escapeDetailHTML(
                        member.wadi
                    )}
                </td>

                <td>
                    ${escapeDetailHTML(
                        member.mobile || "-"
                    )}
                </td>

                <td class="money pending-money">

                    ${formatDetailMoney(
                        pending
                    )}

                </td>

                <td class="money subscription-money">

                    ${formatDetailMoney(
                        subscription2026
                    )}

                </td>

                <td class="money donation-money">

                    ${formatDetailMoney(
                        donation2026
                    )}

                </td>

                <td>

                    <button
                        type="button"
                        class="view-btn"
                    >

                        <i class="fa-solid fa-eye"></i>

                        View

                    </button>

                </td>

            `;


            const button =
                row.querySelector(
                    ".view-btn"
                );


            if (button) {

                button.addEventListener(
                    "click",
                    function() {

                        showMemberDetails(
                            member
                        );

                    }
                );

            }


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   20. SEARCH MEMBERS
========================================================= */

function searchMemberDetails() {

    loadMemberDetailsData();


    const input =
        document.getElementById(
            "memberSearch"
        );


    const keyword =
        normalizeDetailText(
            input
                ? input.value
                : ""
        );


    let filtered =
        detailMembers;


    if (keyword) {

        filtered =
            detailMembers.filter(
                function(member) {

                    const name =
                        normalizeDetailText(
                            member.name
                        );


                    const id =
                        normalizeDetailText(
                            getMemberId(
                                member
                            )
                        );


                    const mobile =
                        normalizeDetailText(
                            member.mobile
                        );


                    const wadi =
                        normalizeDetailText(
                            member.wadi
                        );


                    return (

                        name.includes(
                            keyword
                        )

                        ||

                        id.includes(
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


    const status =
        document.getElementById(
            "searchStatus"
        );


    if (status) {

        if (keyword) {

            status.innerText =
                "Search: " +
                filtered.length +
                " सभासद";

        }
        else {

            status.innerText =
                "सर्व सभासद";

        }

    }


    displayMemberDetailsList(
        filtered
    );

}


/* =========================================================
   21. SHOW MEMBER DETAILS
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


    /*
       Always reload latest data
       before opening details.
    */

    loadMemberDetailsData();


    const latestMember =
        findDetailMember(
            getMemberId(
                member
            )
        ) || member;


    const memberId =
        getMemberId(
            latestMember
        );


    const pending =
        getMemberPending(
            latestMember
        );


    const subscription2026 =
        getMemberSubscriptionFrom2026(
            latestMember
        );


    const donation2026 =
        getFinalMemberDonationFrom2026(
            latestMember
        );


    content.innerHTML = `

        <div class="detail-grid">


            <div class="detail-item">

                <div class="detail-label">
                    सभासद नाव
                </div>

                <div class="detail-value">
                    ${escapeDetailHTML(
                        latestMember.name
                    )}
                </div>

            </div>


            <div class="detail-item">

                <div class="detail-label">
                    Member ID
                </div>

                <div class="detail-value">
                    ${escapeDetailHTML(
                        memberId
                    )}
                </div>

            </div>


            <div class="detail-item">

                <div class="detail-label">
                    वाडी
                </div>

                <div class="detail-value">
                    ${escapeDetailHTML(
                        latestMember.wadi ||
                        "-"
                    )}
                </div>

            </div>


            <div class="detail-item">

                <div class="detail-label">
                    Mobile
                </div>

                <div class="detail-value">
                    ${escapeDetailHTML(
                        latestMember.mobile ||
                        "-"
                    )}
                </div>

            </div>


            <div class="detail-item detail-full">

                <div class="detail-label">
                    पत्ता
                </div>

                <div class="detail-value">
                    ${escapeDetailHTML(
                        latestMember.address ||
                        "-"
                    )}
                </div>

            </div>


        </div>



        <div class="amount-section">

            <div class="amount-section-title">

                आर्थिक माहिती

            </div>


            <div class="amount-grid">


                <div class="amount-card">

                    <div class="label">
                        बाकी वर्गणी
                    </div>

                    <div class="amount pending-money">
                        ${formatDetailMoney(
                            pending
                        )}
                    </div>

                </div>


                <div class="amount-card">

                    <div class="label">
                        2026 पासून जमा वर्गणी
                    </div>

                    <div class="amount subscription-money">
                        ${formatDetailMoney(
                            subscription2026
                        )}
                    </div>

                </div>


                <div class="amount-card">

                    <div class="label">
                        2026 पासून जमा देणगी
                    </div>

                    <div class="amount donation-money">
                        ${formatDetailMoney(
                            donation2026
                        )}
                    </div>

                </div>


            </div>

        </div>

    `;


    modal.style.display =
        "block";

}


/* =========================================================
   22. CLOSE MODAL
========================================================= */

function closeMemberDetailsModal() {

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
   23. SEARCH EVENT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadMemberDetailsData();

        displayMemberDetailsList(
            detailMembers
        );


        const search =
            document.getElementById(
                "memberSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                searchMemberDetails
            );

        }


        const clearButton =
            document.getElementById(
                "clearSearch"
            );


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                function() {

                    if (search) {

                        search.value =
                            "";

                    }

                    searchMemberDetails();

                    if (search) {

                        search.focus();

                    }

                }
            );

        }


        const closeButton =
            document.getElementById(
                "closeModal"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeMemberDetailsModal
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

                        closeMemberDetailsModal();

                    }

                }
            );

        }

    }
);


/* =========================================================
   24. ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeMemberDetailsModal();

        }

    }
);


/* =========================================================
   25. STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function() {

        loadMemberDetailsData();

        searchMemberDetails();

    }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM Member Details page loaded successfully."
);
