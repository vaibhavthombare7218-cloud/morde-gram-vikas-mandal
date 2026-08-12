/* =========================================================
   donation.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   DONATION MANAGEMENT

   Features:
   ✅ Member ID Optional
   ✅ Non-Member Donation Save
   ✅ Member Search
   ✅ Member ID Auto Fill
   ✅ Mobile Auto Fill
   ✅ Donation Date
   ✅ Amount
   ✅ Receipt Number
   ✅ Payment Mode
   ✅ LocalStorage
   ✅ Previous Donors
   ✅ Search Donation History
   ✅ Total Donation
   ✅ Delete Donation
   ✅ Member Record Reflection
   ========================================================= */


const DONATIONS_KEY = "mgvm_donations";
const MEMBERS_KEY = "mgvm_members";



/* =========================================================
   GET DONATIONS
   ========================================================= */

function getDonations() {

    try {

        return JSON.parse(
            localStorage.getItem(DONATIONS_KEY) || "[]"
        );

    } catch (error) {

        console.error(
            "Donation data error:",
            error
        );

        return [];

    }

}



/* =========================================================
   SAVE DONATIONS
   ========================================================= */

function saveDonations(list) {

    localStorage.setItem(
        DONATIONS_KEY,
        JSON.stringify(list)
    );

}



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
           Compatibility with old project
        */

        if (!data) {

            data =
                localStorage.getItem(
                    "members"
                );

        }


        return JSON.parse(
            data || "[]"
        );

    } catch (error) {

        console.error(
            "Member data error:",
            error
        );

        return [];

    }

}



/* =========================================================
   SAVE MEMBERS
   ========================================================= */

function saveMembers(list) {

    localStorage.setItem(
        MEMBERS_KEY,
        JSON.stringify(list)
    );

}



/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* Today's date */

        const dateInput =
            document.getElementById(
                "donationDate"
            );


        if (dateInput) {

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


            dateInput.value =
                `${yyyy}-${mm}-${dd}`;

        }



        /* Member search */

        const memberSearch =
            document.getElementById(
                "memberSearch"
            );


        if (memberSearch) {

            memberSearch.addEventListener(
                "input",
                searchMembers
            );

        }



        /* Close search result */

        document.addEventListener(
            "click",
            function (event) {

                const searchBox =
                    document.querySelector(
                        ".member-search-box"
                    );


                const results =
                    document.getElementById(
                        "memberResults"
                    );


                if (
                    searchBox &&
                    results &&
                    !searchBox.contains(
                        event.target
                    )
                ) {

                    results.innerHTML = "";

                }

            }
        );

    }
);



/* =========================================================
   MEMBER SEARCH
   ========================================================= */

function searchMembers() {

    const input =
        document.getElementById(
            "memberSearch"
        );


    const results =
        document.getElementById(
            "memberResults"
        );


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    results.innerHTML = "";


    if (!keyword) {

        return;

    }


    const members =
        getMembers();


    const matched =
        members
            .filter(
                function (member) {

                    const name =
                        String(
                            member.name || ""
                        ).toLowerCase();


                    const memberId =
                        String(
                            member.memberId || ""
                        ).toLowerCase();


                    const mobile =
                        String(
                            member.mobile || ""
                        ).toLowerCase();


                    return (
                        name.includes(
                            keyword
                        )
                        ||
                        memberId.includes(
                            keyword
                        )
                        ||
                        mobile.includes(
                            keyword
                        )
                    );

                }
            )
            .slice(0, 15);



    matched.forEach(
        function (member) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "member-result";


            div.innerHTML =
                `<strong>
                    ${escapeHtml(
                        member.memberId || ""
                    )}
                </strong>
                -
                ${escapeHtml(
                    member.name || ""
                )}
                <br>
                <small>
                    📱 ${escapeHtml(
                        member.mobile || ""
                    )}
                </small>`;


            div.addEventListener(
                "click",
                function () {

                    selectMember(
                        member
                    );

                }
            );


            results.appendChild(
                div
            );

        }
    );



    if (matched.length === 0) {

        results.innerHTML =
            `<div class="member-result">
                सभासद सापडला नाही.
             </div>`;

    }

}



/* =========================================================
   SELECT MEMBER
   ========================================================= */

function selectMember(member) {

    document.getElementById(
        "donorName"
    ).value =
        member.name || "";


    document.getElementById(
        "memberId"
    ).value =
        member.memberId || "";


    document.getElementById(
        "mobile"
    ).value =
        member.mobile || "";


    document.getElementById(
        "memberSearch"
    ).value =
        `${member.memberId || ""} - ${member.name || ""}`;


    document.getElementById(
        "memberResults"
    ).innerHTML = "";

}



/* =========================================================
   SAVE DONATION
   ========================================================= */

function saveDonation() {


    const donorName =
        document.getElementById(
            "donorName"
        ).value.trim();


    const memberId =
        document.getElementById(
            "memberId"
        ).value.trim();


    const mobile =
        document.getElementById(
            "mobile"
        ).value.trim();


    const donationDate =
        document.getElementById(
            "donationDate"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "amount"
            ).value
        );


    const receiptNo =
        document.getElementById(
            "receiptNo"
        ).value.trim();


    const paymentMode =
        document.getElementById(
            "paymentMode"
        ).value;



    /* =====================================================
       VALIDATION

       Member ID is NOT required.
       This allows non-member donors.
       ===================================================== */

    if (!donorName) {

        alert(
            "कृपया देणगीदाराचे नाव टाका."
        );

        return;

    }


    if (!donationDate) {

        alert(
            "कृपया तारीख निवडा."
        );

        return;

    }


    if (!amount || amount <= 0) {

        alert(
            "कृपया योग्य देणगी रक्कम टाका."
        );

        return;

    }


    if (!paymentMode) {

        alert(
            "कृपया Payment Mode निवडा."
        );

        return;

    }



    /* =====================================================
       DONATION OBJECT
       ===================================================== */

    const donation = {

        id:
            "DON-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            ),

        donorName:
            donorName,

        /*
           Member ID can be empty.
           Non-member donor is allowed.
        */

        memberId:
            memberId || "",

        mobile:
            mobile || "",

        donationDate:
            donationDate,

        amount:
            amount,

        receiptNo:
            receiptNo || "",

        paymentMode:
            paymentMode,

        createdAt:
            new Date().toISOString()

    };



    /* =====================================================
       SAVE DONATION

       This happens even if Member ID is blank.
       ===================================================== */

    const donations =
        getDonations();


    donations.push(
        donation
    );


    saveDonations(
        donations
    );



    /* =====================================================
       MEMBER REFLECTION

       Only when valid Member ID exists.
       ===================================================== */

    if (memberId) {

        updateMemberDonation(
            donation
        );

    }



    /* =====================================================
       SUCCESS
       ===================================================== */

    const success =
        document.getElementById(
            "successMessage"
        );


    success.style.display =
        "block";


    setTimeout(
        function () {

            success.style.display =
                "none";

        },
        3000
    );


    alert(
        "देणगीची नोंद यशस्वीरीत्या सेव्ह झाली."
    );


    clearDonationForm();

}



/* =========================================================
   UPDATE MEMBER DONATION
   ========================================================= */

function updateMemberDonation(
    donation
) {


    /*
       Safety:
       Member ID नसल्यास member data ला
       touch करायचे नाही.
    */

    if (!donation.memberId) {

        return;

    }


    const members =
        getMembers();


    const index =
        members.findIndex(
            function (member) {

                return String(
                    member.memberId || ""
                ).toLowerCase()
                ===
                String(
                    donation.memberId
                ).toLowerCase();

            }
        );


    /*
       Member ID दिली पण member सापडला नाही,
       तरी donation आधीच सुरक्षितपणे
       mgvm_donations मध्ये save झालेली आहे.
    */

    if (index === -1) {

        return;

    }


    const member =
        members[index];



    /* Donation array */

    if (
        !Array.isArray(
            member.donations
        )
    ) {

        member.donations = [];

    }


    /* Duplicate protection */

    const alreadyExists =
        member.donations.some(
            function (item) {

                return (
                    item.id ===
                    donation.id
                );

            }
        );


    if (!alreadyExists) {

        member.donations.push(
            donation
        );

    }



    /* Total Donation */

    member.donationTotal =
        member.donations.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.amount || 0
                    )
                );

            },
            0
        );



    /* Donation Count */

    member.donationCount =
        member.donations.length;



    /* Last Donation */

    const sorted =
        [...member.donations].sort(
            function (a, b) {

                return (
                    new Date(
                        b.donationDate
                    )
                    -
                    new Date(
                        a.donationDate
                    )
                );

            }
        );


    if (sorted.length > 0) {

        member.lastDonationDate =
            sorted[0].donationDate;


        member.lastDonationAmount =
            Number(
                sorted[0].amount || 0
            );

    }



    members[index] =
        member;


    saveMembers(
        members
    );

}



/* =========================================================
   CLEAR FORM
   ========================================================= */

function clearDonationForm() {


    document.getElementById(
        "donorName"
    ).value = "";


    document.getElementById(
        "memberSearch"
    ).value = "";


    document.getElementById(
        "memberId"
    ).value = "";


    document.getElementById(
        "mobile"
    ).value = "";


    document.getElementById(
        "amount"
    ).value = "";


    document.getElementById(
        "receiptNo"
    ).value = "";


    document.getElementById(
        "paymentMode"
    ).value = "";


    document.getElementById(
        "memberResults"
    ).innerHTML = "";



    /* Reset date */

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


    document.getElementById(
        "donationDate"
    ).value =
        `${yyyy}-${mm}-${dd}`;

}



/* =========================================================
   SHOW HISTORY
   ========================================================= */

function showDonationHistory() {

    document.getElementById(
        "donationFormSection"
    ).style.display =
        "none";


    document.getElementById(
        "historySection"
    ).style.display =
        "block";


    document.getElementById(
        "historySearch"
    ).value = "";


    displayDonationHistory();

}



/* =========================================================
   SHOW FORM
   ========================================================= */

function showDonationForm() {

    document.getElementById(
        "historySection"
    ).style.display =
        "none";


    document.getElementById(
        "donationFormSection"
    ).style.display =
        "block";

}



/* =========================================================
   DISPLAY DONATION HISTORY
   ========================================================= */

function displayDonationHistory() {


    const tbody =
        document.getElementById(
            "donationHistoryBody"
        );


    const searchInput =
        document.getElementById(
            "historySearch"
        );


    const keyword =
        (
            searchInput
                ? searchInput.value
                : ""
        )
        .trim()
        .toLowerCase();


    const donations =
        getDonations();


    const filtered =
        donations.filter(
            function (donation) {

                if (!keyword) {

                    return true;

                }


                return (

                    String(
                        donation.donorName || ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    )

                    ||

                    String(
                        donation.memberId || ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    )

                    ||

                    String(
                        donation.mobile || ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    )

                    ||

                    String(
                        donation.receiptNo || ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    )

                    ||

                    String(
                        donation.paymentMode || ""
                    )
                    .toLowerCase()
                    .includes(
                        keyword
                    )

                );

            }
        )
        .sort(
            function (a, b) {

                return (
                    new Date(
                        b.donationDate
                    )
                    -
                    new Date(
                        a.donationDate
                    )
                );

            }
        );



    /* =====================================================
       TOTAL
       ===================================================== */

    const total =
        filtered.reduce(
            function (
                sum,
                donation
            ) {

                return (
                    sum +
                    Number(
                        donation.amount || 0
                    )
                );

            },
            0
        );


    document.getElementById(
        "totalDonation"
    ).innerHTML =
        `एकूण देणगी: ₹${formatNumber(total)}`;


    tbody.innerHTML = "";



    /* No records */

    if (
        filtered.length === 0
    ) {

        tbody.innerHTML =
            `<tr>
                <td colspan="9"
                    class="empty-message">

                    कोणतीही देणगी नोंद सापडली नाही.

                </td>
             </tr>`;

        return;

    }



    /* Display records */

    filtered.forEach(
        function (
            donation,
            index
        ) {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        donation.donorName || ""
                    )}
                </td>

                <td>
                    ${
                        donation.memberId
                        ?
                        escapeHtml(
                            donation.memberId
                        )
                        :
                        "Non-Member"
                    }
                </td>

                <td>
                    ${escapeHtml(
                        donation.mobile || "-"
                    )}
                </td>

                <td>
                    ${formatDate(
                        donation.donationDate
                    )}
                </td>

                <td>
                    ₹${formatNumber(
                        donation.amount
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        donation.receiptNo || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        donation.paymentMode || "-"
                    )}
                </td>

                <td>

                    <button
                        class="btn btn-delete"
                        onclick="deleteDonation('${donation.id}')">

                        Delete

                    </button>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}



/* =========================================================
   DELETE DONATION
   ========================================================= */

function deleteDonation(
    donationId
) {


    const confirmDelete =
        confirm(
            "ही देणगी नोंद Delete करायची आहे का?"
        );


    if (!confirmDelete) {

        return;

    }


    let donations =
        getDonations();


    const donation =
        donations.find(
            function (item) {

                return (
                    item.id ===
                    donationId
                );

            }
        );


    if (!donation) {

        return;

    }


    donations =
        donations.filter(
            function (item) {

                return (
                    item.id !==
                    donationId
                );

            }
        );


    saveDonations(
        donations
    );



    /*
       Member ID असल्यासच
       member record मधून remove करा.
    */

    if (donation.memberId) {

        removeDonationFromMember(
            donation
        );

    }


    displayDonationHistory();


    alert(
        "देणगीची नोंद Delete झाली."
    );

}



/* =========================================================
   REMOVE DONATION FROM MEMBER
   ========================================================= */

function removeDonationFromMember(
    donation
) {


    if (!donation.memberId) {

        return;

    }


    const members =
        getMembers();


    const index =
        members.findIndex(
            function (member) {

                return String(
                    member.memberId || ""
                ).toLowerCase()
                ===
                String(
                    donation.memberId
                ).toLowerCase();

            }
        );


    if (index === -1) {

        return;

    }


    const member =
        members[index];


    if (
        !Array.isArray(
            member.donations
        )
    ) {

        return;

    }


    member.donations =
        member.donations.filter(
            function (item) {

                return (
                    item.id !==
                    donation.id
                );

            }
        );



    /* Recalculate total */

    member.donationTotal =
        member.donations.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.amount || 0
                    )
                );

            },
            0
        );



    /* Count */

    member.donationCount =
        member.donations.length;



    /* Latest donation */

    if (
        member.donations.length > 0
    ) {

        const sorted =
            [...member.donations].sort(
                function (a, b) {

                    return (
                        new Date(
                            b.donationDate
                        )
                        -
                        new Date(
                            a.donationDate
                        )
                    );

                }
            );


        member.lastDonationDate =
            sorted[0].donationDate;


        member.lastDonationAmount =
            Number(
                sorted[0].amount || 0
            );

    } else {

        member.lastDonationDate =
            "";

        member.lastDonationAmount =
            0;

    }


    members[index] =
        member;


    saveMembers(
        members
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


    const parts =
        dateString.split("-");


    if (
        parts.length === 3
    ) {

        return (
            parts[2] +
            "/" +
            parts[1] +
            "/" +
            parts[0]
        );

    }


    return dateString;

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
