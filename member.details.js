/* =========================================================
   member-details.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   MEMBER DETAILS / FINANCIAL REPORT

   Compatible With:
   ✅ mgvm_members
   ✅ mgvm_subscriptions
   ✅ mgvm_donations

   IMPORTANT:
   This file ONLY READS existing data.

   ❌ Save logic नाही
   ❌ Edit logic नाही
   ❌ Delete logic नाही
   ❌ Existing subscription logic बदलत नाही
   ❌ Existing donation logic बदलत नाही
========================================================= */


/* =========================================================
   1. LOCAL STORAGE KEYS
========================================================= */

const MEMBER_DETAILS_KEYS = {

    MEMBERS:
        "mgvm_members",

    OLD_MEMBERS:
        "members",

    SUBSCRIPTIONS:
        "mgvm_subscriptions",

    DONATIONS:
        "mgvm_donations"

};


/* =========================================================
   2. GET ARRAY FROM LOCAL STORAGE
========================================================= */

function getMemberDetailsArray(key) {

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
            "LocalStorage Read Error:",
            key,
            error
        );

        return [];

    }

}


/* =========================================================
   3. LOAD ALL DATA
========================================================= */

function loadMemberDetailsData() {

    let members =
        getMemberDetailsArray(
            MEMBER_DETAILS_KEYS.MEMBERS
        );


    /*
       Old project compatibility
    */

    if (members.length === 0) {

        members =
            getMemberDetailsArray(
                MEMBER_DETAILS_KEYS.OLD_MEMBERS
            );

    }


    const subscriptions =
        getMemberDetailsArray(
            MEMBER_DETAILS_KEYS.SUBSCRIPTIONS
        );


    const donations =
        getMemberDetailsArray(
            MEMBER_DETAILS_KEYS.DONATIONS
        );


    return {

        members,
        subscriptions,
        donations

    };

}


/* =========================================================
   4. GET MEMBER INTERNAL ID
========================================================= */

function getMemberInternalId(member) {

    return String(
        member?.id || ""
    ).trim();

}


/* =========================================================
   5. GET MEMBER DISPLAY ID
========================================================= */

function getMemberDisplayId(member) {

    /*
       New subscription system uses:
       member.id

       Older members system may use:
       member.memberId
    */

    return String(
        member?.memberId ||
        member?.id ||
        ""
    ).trim();

}


/* =========================================================
   6. GET MEMBER NAME
========================================================= */

function getMemberName(member) {

    return String(
        member?.name ||
        member?.memberName ||
        ""
    ).trim();

}


/* =========================================================
   7. GET MEMBER MOBILE
========================================================= */

function getMemberMobile(member) {

    return String(
        member?.mobile ||
        member?.phone ||
        member?.mobileNumber ||
        ""
    ).trim();

}


/* =========================================================
   8. GET MEMBER WADI
========================================================= */

function getMemberWadi(member) {

    return String(
        member?.wadi ||
        ""
    ).trim();

}


/* =========================================================
   9. GET MEMBER DOB
========================================================= */

function getMemberDOB(member) {

    return String(
        member?.dob ||
        member?.birthDate ||
        member?.dateOfBirth ||
        ""
    ).trim();

}


/* =========================================================
   10. GET MEMBER ADDRESS
========================================================= */

function getMemberAddress(member) {

    return String(
        member?.address ||
        member?.fullAddress ||
        ""
    ).trim();

}


/* =========================================================
   11. GET MEMBER PHOTO
========================================================= */

function getMemberPhoto(member) {

    return String(
        member?.photo ||
        member?.photoData ||
        member?.image ||
        ""
    ).trim();

}


/* =========================================================
   12. NUMBER CONVERSION
========================================================= */

function memberDetailsNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(
            String(value)
                .replace(/₹/g, "")
                .replace(/,/g, "")
                .trim()
        );


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   13. MONEY FORMAT
========================================================= */

function memberDetailsMoney(value) {

    return (
        "₹" +
        memberDetailsNumber(
            value
        ).toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   14. HTML ESCAPE
========================================================= */

function memberDetailsEscape(value) {

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
   15. GET TRANSACTION MEMBER ID
========================================================= */

function getTransactionMemberId(
    transaction
) {

    return String(
        transaction?.memberId ||
        ""
    ).trim();

}


/* =========================================================
   16. CHECK TRANSACTION MEMBER
========================================================= */

function isTransactionForMember(
    transaction,
    member
) {

    const transactionId =
        getTransactionMemberId(
            transaction
        );


    if (!transactionId) {

        return false;

    }


    const internalId =
        getMemberInternalId(
            member
        );


    const displayId =
        getMemberDisplayId(
            member
        );


    /*
       Subscription:
       transaction.memberId = member.id

       Donation:
       transaction.memberId = member.memberId

       म्हणून दोन्ही check.
    */

    if (
        internalId &&
        transactionId.toLowerCase() ===
        internalId.toLowerCase()
    ) {

        return true;

    }


    if (
        displayId &&
        transactionId.toLowerCase() ===
        displayId.toLowerCase()
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   17. GET YEAR FROM SUBSCRIPTION
========================================================= */

function getSubscriptionStartYear(
    transaction
) {

    const year =
        String(
            transaction?.year || ""
        ).trim();


    /*
       Example:
       2026-27
       2025-26
    */

    const match =
        year.match(
            /^(20\d{2})/
        );


    if (!match) {

        return 0;

    }


    return Number(
        match[1]
    );

}


/* =========================================================
   18. GET DONATION YEAR
========================================================= */

function getDonationYear(
    donation
) {

    const date =
        donation?.donationDate;


    if (!date) {

        return 0;

    }


    /*
       YYYY-MM-DD
    */

    const match =
        String(date).match(
            /^(\d{4})/
        );


    if (match) {

        return Number(
            match[1]
        );

    }


    /*
       Fallback
    */

    const parsed =
        new Date(date);


    if (
        !isNaN(
            parsed.getTime()
        )
    ) {

        return parsed.getFullYear();

    }


    return 0;

}


/* =========================================================
   19. 2026 ONWARDS SUBSCRIPTION
========================================================= */

function get2026SubscriptionAmount(
    member,
    subscriptions
) {

    return subscriptions
        .filter(
            function(transaction) {

                return (

                    isTransactionForMember(
                        transaction,
                        member
                    )

                    &&

                    getSubscriptionStartYear(
                        transaction
                    ) >= 2026

                );

            }
        )
        .reduce(
            function(total, transaction) {

                return (
                    total +
                    memberDetailsNumber(
                        transaction.paidAmount
                    )
                );

            },
            0
        );

}


/* =========================================================
   20. 2026 ONWARDS DONATION
========================================================= */

function get2026DonationAmount(
    member,
    donations
) {

    return donations
        .filter(
            function(donation) {

                return (

                    isTransactionForMember(
                        donation,
                        member
                    )

                    &&

                    getDonationYear(
                        donation
                    ) >= 2026

                );

            }
        )
        .reduce(
            function(total, donation) {

                return (
                    total +
                    memberDetailsNumber(
                        donation.amount
                    )
                );

            },
            0
        );

}


/* =========================================================
   21. GET PENDING SUBSCRIPTION
========================================================= */

function getMemberPendingAmount(
    member
) {

    /*
       subscription.js मध्ये
       member.subscriptionPending
       हा actual outstanding balance आहे.

       त्यामुळे हाच primary source.
    */

    return Math.max(
        0,
        memberDetailsNumber(
            member?.subscriptionPending
        )
    );

}


/* =========================================================
   22. GET SUBSCRIPTION TRANSACTIONS
========================================================= */

function getMemberSubscriptionTransactions(
    member,
    subscriptions
) {

    return subscriptions
        .filter(
            function(transaction) {

                return isTransactionForMember(
                    transaction,
                    member
                );

            }
        )
        .filter(
            function(transaction) {

                return (
                    getSubscriptionStartYear(
                        transaction
                    ) >= 2026
                );

            }
        )
        .sort(
            function(a, b) {

                return String(
                    b.paymentDate || ""
                ).localeCompare(
                    String(
                        a.paymentDate || ""
                    )
                );

            }
        );

}


/* =========================================================
   23. GET DONATION TRANSACTIONS
========================================================= */

function getMemberDonationTransactions(
    member,
    donations
) {

    return donations
        .filter(
            function(donation) {

                return isTransactionForMember(
                    donation,
                    member
                );

            }
        )
        .filter(
            function(donation) {

                return (
                    getDonationYear(
                        donation
                    ) >= 2026
                );

            }
        )
        .sort(
            function(a, b) {

                return String(
                    b.donationDate || ""
                ).localeCompare(
                    String(
                        a.donationDate || ""
                    )
                );

            }

        );

}


/* =========================================================
   24. FORMAT DATE
========================================================= */

function memberDetailsDate(
    date
) {

    if (!date) {

        return "-";

    }


    const parts =
        String(date).split("-");


    if (
        parts.length === 3 &&
        parts[0].length === 4
    ) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return date;

}


/* =========================================================
   25. LOAD MEMBER TABLE
========================================================= */

function loadMemberDetailsTable() {

    const data =
        loadMemberDetailsData();


    const members =
        data.members;


    const subscriptions =
        data.subscriptions;


    const donations =
        data.donations;


    const tbody =
        document.getElementById(
            "memberTableBody"
        );


    const count =
        document.getElementById(
            "memberCount"
        );


    const status =
        document.getElementById(
            "searchStatus"
        );


    const searchInput =
        document.getElementById(
            "memberSearch"
        );


    if (!tbody) {

        return;

    }


    const keyword =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const filteredMembers =
        members.filter(
            function(member) {

                const id =
                    getMemberDisplayId(
                        member
                    ).toLowerCase();


                const name =
                    getMemberName(
                        member
                    ).toLowerCase();


                const mobile =
                    getMemberMobile(
                        member
                    ).toLowerCase();


                const wadi =
                    getMemberWadi(
                        member
                    ).toLowerCase();


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


    if (count) {

        count.textContent =
            filteredMembers.length;

    }


    if (status) {

        status.textContent =
            keyword
                ?
                "शोध परिणाम: " +
                filteredMembers.length +
                " सभासद"
                :
                "सर्व सभासद";

    }


    if (
        filteredMembers.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty-message"
                >

                    कोणताही सभासद सापडला नाही.

                </td>

            </tr>

        `;

        return;

    }


    let html = "";


    filteredMembers.forEach(
        function(member, index) {

            const pending =
                getMemberPendingAmount(
                    member
                );


            const subscription2026 =
                get2026SubscriptionAmount(
                    member,
                    subscriptions
                );


            const donation2026 =
                get2026DonationAmount(
                    member,
                    donations
                );


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${memberDetailsEscape(
                                getMemberName(
                                    member
                                )
                            )}
                        </strong>
                    </td>

                    <td>
                        ${memberDetailsEscape(
                            getMemberDisplayId(
                                member
                            )
                        )}
                    </td>

                    <td>
                        ${memberDetailsEscape(
                            getMemberWadi(
                                member
                            )
                        )}
                    </td>

                    <td>
                        ${memberDetailsEscape(
                            getMemberMobile(
                                member
                            )
                        )}
                    </td>

                    <td
                        class="${
                            pending > 0
                                ? "pending-amount"
                                : "paid-amount"
                        }"
                    >

                        ${memberDetailsMoney(
                            pending
                        )}

                    </td>

                    <td>

                        ${memberDetailsMoney(
                            subscription2026
                        )}

                    </td>

                    <td>

                        ${memberDetailsMoney(
                            donation2026
                        )}

                    </td>

                    <td>

                        <button
                            type="button"
                            class="details-btn"
                            onclick="showMemberDetails('${memberDetailsEscape(
                                getMemberInternalId(member)
                            )}')"
                        >

                            <i
                                class="fa-solid fa-eye"
                            ></i>

                            माहिती

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    tbody.innerHTML =
        html;

}


/* =========================================================
   26. SHOW MEMBER DETAILS
========================================================= */

function showMemberDetails(
    memberId
) {

    const data =
        loadMemberDetailsData();


    const members =
        data.members;


    const subscriptions =
        data.subscriptions;


    const donations =
        data.donations;


    const member =
        members.find(
            function(item) {

                return (
                    String(
                        getMemberInternalId(
                            item
                        )
                    ) ===
                    String(
                        memberId
                    )
                );

            }
        );


    if (!member) {

        /*
           Compatibility with memberId
        */

        const fallback =
            members.find(
                function(item) {

                    return (
                        String(
                            getMemberDisplayId(
                                item
                            )
                        ) ===
                        String(
                            memberId
                        )
                    );

                }
            );


        if (!fallback) {

            alert(
                "सभासद माहिती सापडली नाही."
            );

            return;

        }


        openMemberDetailsModal(
            fallback,
            subscriptions,
            donations
        );

        return;

    }


    openMemberDetailsModal(
        member,
        subscriptions,
        donations
    );

}


/* =========================================================
   27. OPEN MEMBER MODAL
========================================================= */

function openMemberDetailsModal(
    member,
    subscriptions,
    donations
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


    const pending =
        getMemberPendingAmount(
            member
        );


    const subscription2026 =
        get2026SubscriptionAmount(
            member,
            subscriptions
        );


    const donation2026 =
        get2026DonationAmount(
            member,
            donations
        );


    const photo =
        getMemberPhoto(
            member
        );


    content.innerHTML = `

        <div class="member-profile">

            <div class="profile-photo">

                ${
                    photo
                    ?
                    `
                    <img
                        src="${memberDetailsEscape(
                            photo
                        )}"
                        alt="सभासद फोटो"
                    >
                    `
                    :
                    `
                    <div class="no-photo">

                        <i
                            class="fa-solid fa-user"
                        ></i>

                    </div>
                    `
                }

            </div>


            <div class="profile-info">

                <h3>

                    ${memberDetailsEscape(
                        getMemberName(
                            member
                        )
                    )}

                </h3>


                <p>

                    <strong>
                        Member ID:
                    </strong>

                    ${memberDetailsEscape(
                        getMemberDisplayId(
                            member
                        )
                    )}

                </p>


                <p>

                    <strong>
                        मोबाईल:
                    </strong>

                    ${memberDetailsEscape(
                        getMemberMobile(
                            member
                        )
                    )}

                </p>


                <p>

                    <strong>
                        वाडी:
                    </strong>

                    ${memberDetailsEscape(
                        getMemberWadi(
                            member
                        )
                    )}

                </p>


                <p>

                    <strong>
                        जन्मतारीख:
                    </strong>

                    ${memberDetailsEscape(
                        getMemberDOB(
                            member
                        )
                    )}

                </p>


                <p>

                    <strong>
                        पत्ता:
                    </strong>

                    ${memberDetailsEscape(
                        getMemberAddress(
                            member
                        )
                    )}

                </p>

            </div>

        </div>


        <hr>


        <div class="financial-summary">


            <div class="summary-box pending-box">

                <span>
                    बाकी वर्गणी
                </span>

                <strong>
                    ${memberDetailsMoney(
                        pending
                    )}
                </strong>

            </div>


            <div class="summary-box">

                <span>
                    2026 पासून जमा वर्गणी
                </span>

                <strong>
                    ${memberDetailsMoney(
                        subscription2026
                    )}
                </strong>

            </div>


            <div class="summary-box">

                <span>
                    2026 पासून जमा देणगी
                </span>

                <strong>
                    ${memberDetailsMoney(
                        donation2026
                    )}
                </strong>

            </div>


        </div>


        <hr>


        <h3>

            <i
                class="fa-solid fa-money-bill-wave"
            ></i>

            2026 पासून वर्गणी व्यवहार

        </h3>


        ${buildSubscriptionHistoryHTML(
            member,
            subscriptions
        )}


        <h3
            style="margin-top:25px;"
        >

            <i
                class="fa-solid fa-hand-holding-heart"
            ></i>

            2026 पासून देणगी व्यवहार

        </h3>


        ${buildDonationHistoryHTML(
            member,
            donations
        )}

    `;


    modal.style.display =
        "flex";

}


/* =========================================================
   28. SUBSCRIPTION HISTORY HTML
========================================================= */

function buildSubscriptionHistoryHTML(
    member,
    subscriptions
) {

    const transactions =
        getMemberSubscriptionTransactions(
            member,
            subscriptions
        );


    if (
        transactions.length === 0
    ) {

        return `

            <p class="no-transactions">

                2026 पासून कोणताही वर्गणी व्यवहार नाही.

            </p>

        `;

    }


    let html = `

        <div class="transaction-list">

    `;


    transactions.forEach(
        function(transaction) {

            html += `

                <div class="transaction-row">

                    <span>

                        <strong>
                            ${memberDetailsEscape(
                                transaction.year
                            )}
                        </strong>

                        <br>

                        ${memberDetailsDate(
                            transaction.paymentDate
                        )}

                    </span>


                    <span>

                        जमा:
                        <strong>
                            ${memberDetailsMoney(
                                transaction.paidAmount
                            )}
                        </strong>

                    </span>


                    <span>

                        पावती:
                        ${memberDetailsEscape(
                            transaction.receiptNo || "-"
                        )}

                    </span>


                    <span>

                        ${memberDetailsEscape(
                            transaction.paymentMode || "-"
                        )}

                    </span>

                </div>

            `;

        }
    );


    html += `
        </div>
    `;


    return html;

}


/* =========================================================
   29. DONATION HISTORY HTML
========================================================= */

function buildDonationHistoryHTML(
    member,
    donations
) {

    const transactions =
        getMemberDonationTransactions(
            member,
            donations
        );


    if (
        transactions.length === 0
    ) {

        return `

            <p class="no-transactions">

                2026 पासून कोणताही देणगी व्यवहार नाही.

            </p>

        `;

    }


    let html = `

        <div class="transaction-list">

    `;


    transactions.forEach(
        function(donation) {

            html += `

                <div class="transaction-row">

                    <span>

                        ${memberDetailsDate(
                            donation.donationDate
                        )}

                    </span>


                    <span>

                        जमा:

                        <strong>

                            ${memberDetailsMoney(
                                donation.amount
                            )}

                        </strong>

                    </span>


                    <span>

                        पावती:

                        ${memberDetailsEscape(
                            donation.receiptNo || "-"
                        )}

                    </span>


                    <span>

                        ${memberDetailsEscape(
                            donation.paymentMode || "-"
                        )}

                    </span>

                </div>

            `;

        }
    );


    html += `
        </div>
    `;


    return html;

}


/* =========================================================
   30. CLOSE MODAL
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
   31. SEARCH CLEAR
========================================================= */

function clearMemberDetailsSearch() {

    const input =
        document.getElementById(
            "memberSearch"
        );


    if (input) {

        input.value =
            "";

    }


    loadMemberDetailsTable();

}


/* =========================================================
   32. DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadMemberDetailsTable();


        /* SEARCH */

        const search =
            document.getElementById(
                "memberSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                loadMemberDetailsTable
            );

        }


        /* CLEAR */

        const clear =
            document.getElementById(
                "clearSearch"
            );


        if (clear) {

            clear.addEventListener(
                "click",
                clearMemberDetailsSearch
            );

        }


        /* CLOSE */

        const close =
            document.getElementById(
                "closeModal"
            );


        if (close) {

            close.addEventListener(
                "click",
                closeMemberDetailsModal
            );

        }


        /* CLICK OUTSIDE */

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
   33. STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function() {

        loadMemberDetailsTable();

    }
);


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM Member Details loaded successfully."
);
