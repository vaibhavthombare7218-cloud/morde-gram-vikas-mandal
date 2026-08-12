/* =========================================================
   wadi_report.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   NEW LOGIC

   ✅ mgvm_members मधून data
   ✅ subscriptionPending वापरला आहे
   ✅ जुना "pending" LocalStorage वापरलेला नाही
   ✅ Wadi Wise Grouping
   ✅ Member Search
   ✅ Wadi Search
   ✅ Member ID Search
   ✅ Mobile Search
   ✅ Pending > 0 members only
   ✅ Wadi Total
   ✅ Grand Total
   ✅ Print Report
========================================================= */


/* =========================================================
   1. GLOBAL
========================================================= */

let members = [];


/* =========================================================
   2. LOAD MEMBERS
========================================================= */

function loadMembers() {

    try {

        const stored =
            localStorage.getItem(
                "mgvm_members"
            );


        if (stored) {

            const parsed =
                JSON.parse(stored);


            members =
                Array.isArray(parsed)
                    ? parsed
                    : [];

        }
        else {

            members = [];

        }

    }
    catch (error) {

        console.error(
            "Wadi Report Member Load Error:",
            error
        );

        members = [];

    }

}


/* =========================================================
   3. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
   4. FORMAT AMOUNT
========================================================= */

function formatAmount(amount) {

    const value =
        Number(amount) || 0;


    return value.toLocaleString(
        "en-IN"
    );

}


/* =========================================================
   5. GET MEMBER PENDING
========================================================= */

function getMemberPending(member) {

    if (!member) {

        return 0;

    }


    const amount =
        Number(
            member.subscriptionPending
        );


    if (
        !Number.isFinite(amount)
    ) {

        return 0;

    }


    return Math.max(
        0,
        amount
    );

}


/* =========================================================
   6. SEARCH
========================================================= */

function getSearchKeyword() {

    const search =
        document.getElementById(
            "search"
        );


    if (!search) {

        return "";

    }


    return String(
        search.value || ""
    )
    .trim()
    .toLowerCase();

}


/* =========================================================
   7. FILTER MEMBERS
========================================================= */

function getFilteredMembers() {

    const keyword =
        getSearchKeyword();


    return members.filter(
        function(member) {

            /*
               IMPORTANT:
               फक्त बाकी असलेले सभासद
            */

            const pending =
                getMemberPending(
                    member
                );


            if (
                pending <= 0
            ) {

                return false;

            }


            if (!keyword) {

                return true;

            }


            const name =
                String(
                    member.name || ""
                )
                .toLowerCase();


            const wadi =
                String(
                    member.wadi || ""
                )
                .toLowerCase();


            const id =
                String(
                    member.id || ""
                )
                .toLowerCase();


            const mobile =
                String(
                    member.mobile || ""
                )
                .toLowerCase();


            return (

                name.includes(
                    keyword
                )

                ||

                wadi.includes(
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

            );

        }
    );

}


/* =========================================================
   8. GROUP BY WADI
========================================================= */

function groupMembersByWadi(
    filteredMembers
) {

    const groups = {};


    filteredMembers.forEach(
        function(member) {

            const wadiName =
                String(
                    member.wadi || ""
                )
                .trim();


            const finalWadi =
                wadiName ||
                "वाडी नमूद नाही";


            if (
                !groups[finalWadi]
            ) {

                groups[finalWadi] = {

                    members: [],

                    totalAmount: 0

                };

            }


            const pending =
                getMemberPending(
                    member
                );


            groups[finalWadi]
                .members
                .push(member);


            groups[finalWadi]
                .totalAmount +=
                pending;

        }
    );


    return groups;

}


/* =========================================================
   9. LOAD REPORT
========================================================= */

function loadReport() {

    /*
       प्रत्येक refresh वेळी
       latest LocalStorage data load करा.
    */

    loadMembers();


    const report =
        document.getElementById(
            "report"
        );


    const grandSummary =
        document.getElementById(
            "grandSummary"
        );


    if (!report) {

        return;

    }


    const filteredMembers =
        getFilteredMembers();


    const groups =
        groupMembersByWadi(
            filteredMembers
        );


    let grandMembers = 0;

    let grandAmount = 0;


    Object.keys(
        groups
    ).forEach(
        function(wadi) {

            grandMembers +=
                groups[wadi]
                    .members
                    .length;


            grandAmount +=
                groups[wadi]
                    .totalAmount;

        }
    );


    /* =====================================================
       GRAND SUMMARY
    ===================================================== */

    if (grandSummary) {

        grandSummary.innerHTML = `

            <div class="summary-box">

                <h3>
                    👥 बाकी असलेले सभासद
                </h3>

                <div class="amount">
                    ${grandMembers}
                </div>

            </div>


            <div class="summary-box">

                <h3>
                    🏘️ एकूण वाडी
                </h3>

                <div class="amount">
                    ${Object.keys(groups).length}
                </div>

            </div>


            <div class="summary-box">

                <h3>
                    💰 एकूण बाकी
                </h3>

                <div class="amount">
                    ₹${formatAmount(
                        grandAmount
                    )}
                </div>

            </div>

        `;

    }


    /* =====================================================
       NO DATA
    ===================================================== */

    if (
        filteredMembers.length === 0
    ) {

        report.innerHTML = `

            <div class="card no-data">

                🔎 शोधानुसार बाकी असलेला
                कोणताही सभासद सापडला नाही.

            </div>

        `;

        return;

    }


    /* =====================================================
       WADI SORT
    ===================================================== */

    const sortedWadis =
        Object.keys(
            groups
        )
        .sort(
            function(a, b) {

                return a.localeCompare(
                    b,
                    "mr"
                );

            }
        );


    let html = "";


    /* =====================================================
       EACH WADI
    ===================================================== */

    sortedWadis.forEach(
        function(wadiName) {

            const group =
                groups[wadiName];


            html += `

                <div class="wadi-card">


                    <div class="wadi-title">

                        <h2>
                            🏘️
                            ${escapeHTML(
                                wadiName
                            )}
                        </h2>

                    </div>


                    <div class="wadi-info">

                        <span>

                            👥
                            <b>
                                सभासद:
                            </b>

                            ${group.members.length}

                        </span>


                        <span class="pending-amount">

                            💰
                            <b>
                                एकूण बाकी:
                            </b>

                            ₹${formatAmount(
                                group.totalAmount
                            )}

                        </span>

                    </div>


                    <div
                        style="
                            overflow-x:auto;
                        "
                    >

                        <table
                            class="report-table"
                        >

                            <thead>

                                <tr>

                                    <th>
                                        क्र.
                                    </th>

                                    <th>
                                        Member ID
                                    </th>

                                    <th>
                                        सभासद नाव
                                    </th>

                                    <th>
                                        मोबाईल
                                    </th>

                                    <th>
                                        बाकी वर्गणी
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

            `;


            group.members.forEach(
                function(
                    member,
                    index
                ) {

                    const pending =
                        getMemberPending(
                            member
                        );


                    html += `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    member.id
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    member.name
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    member.mobile
                                )}
                            </td>

                            <td
                                style="
                                    font-weight:bold;
                                "
                            >
                                ₹${formatAmount(
                                    pending
                                )}
                            </td>

                        </tr>

                    `;

                }
            );


            html += `

                            </tbody>

                        </table>

                    </div>

                </div>

            `;

        }
    );


    report.innerHTML =
        html;

}


/* =========================================================
   10. PRINT REPORT
========================================================= */

function printWadiReport() {

    loadMembers();


    const filteredMembers =
        getFilteredMembers();


    if (
        filteredMembers.length === 0
    ) {

        alert(
            "Print करण्यासाठी बाकी असलेले सभासद उपलब्ध नाहीत."
        );

        return;

    }


    const groups =
        groupMembersByWadi(
            filteredMembers
        );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Popup Blocker मुळे Print Window उघडता आली नाही."
        );

        return;

    }


    let grandMembers = 0;

    let grandAmount = 0;


    Object.keys(
        groups
    ).forEach(
        function(wadi) {

            grandMembers +=
                groups[wadi]
                    .members
                    .length;


            grandAmount +=
                groups[wadi]
                    .totalAmount;

        }
    );


    let reportHTML = "";


    const sortedWadis =
        Object.keys(
            groups
        )
        .sort(
            function(a, b) {

                return a.localeCompare(
                    b,
                    "mr"
                );

            }
        );


    sortedWadis.forEach(
        function(wadiName) {

            const group =
                groups[wadiName];


            reportHTML += `

                <div class="wadi">

                    <h2>
                        🏘️
                        ${escapeHTML(
                            wadiName
                        )}
                    </h2>


                    <p>

                        <b>
                            सभासद:
                        </b>

                        ${group.members.length}

                        &nbsp;&nbsp;&nbsp;

                        <b>
                            एकूण बाकी:
                        </b>

                        ₹${formatAmount(
                            group.totalAmount
                        )}

                    </p>


                    <table>

                        <thead>

                            <tr>

                                <th>
                                    क्र.
                                </th>

                                <th>
                                    Member ID
                                </th>

                                <th>
                                    सभासद नाव
                                </th>

                                <th>
                                    मोबाईल
                                </th>

                                <th>
                                    बाकी
                                </th>

                            </tr>

                        </thead>


                        <tbody>

            `;


            group.members.forEach(
                function(
                    member,
                    index
                ) {

                    reportHTML += `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    member.id
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    member.name
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    member.mobile
                                )}
                            </td>

                            <td>
                                ₹${formatAmount(
                                    getMemberPending(
                                        member
                                    )
                                )}
                            </td>

                        </tr>

                    `;

                }
            );


            reportHTML += `

                        </tbody>

                    </table>

                </div>

            `;

        }
    );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="mr">

        <head>

            <meta charset="UTF-8">

            <title>
                वाडीनुसार बाकी वर्गणी रिपोर्ट
            </title>


            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    padding:
                        20px;

                }


                h1 {

                    text-align:
                        center;

                }


                .date {

                    text-align:
                        center;

                    margin-bottom:
                        20px;

                }


                .summary {

                    display:
                        flex;

                    justify-content:
                        space-around;

                    border:
                        1px solid #333;

                    padding:
                        12px;

                    margin-bottom:
                        20px;

                }


                .wadi {

                    margin-bottom:
                        30px;

                    page-break-inside:
                        avoid;

                }


                .wadi h2 {

                    margin-bottom:
                        5px;

                }


                table {

                    width:
                        100%;

                    border-collapse:
                        collapse;

                }


                th,
                td {

                    border:
                        1px solid #333;

                    padding:
                        7px;

                    text-align:
                        center;

                }


                th {

                    background:
                        #eeeeee;

                }


                @media print {

                    @page {

                        size:
                            A4 portrait;

                        margin:
                            10mm;

                    }

                }

            </style>

        </head>


        <body>


            <h1>
                मोर्डे ग्राम विकास मंडळ, मुंबई
            </h1>


            <h1>
                वाडीनुसार बाकी वर्गणी रिपोर्ट
            </h1>


            <div class="date">

                तारीख:
                ${new Date()
                    .toLocaleDateString(
                        "mr-IN"
                    )}

            </div>


            <div class="summary">

                <div>

                    <b>
                        बाकी सभासद:
                    </b>

                    ${grandMembers}

                </div>


                <div>

                    <b>
                        वाडी:
                    </b>

                    ${sortedWadis.length}

                </div>


                <div>

                    <b>
                        एकूण बाकी:
                    </b>

                    ₹${formatAmount(
                        grandAmount
                    )}

                </div>

            </div>


            ${reportHTML}


        </body>

        </html>

    `);


    printWindow.document.close();


    setTimeout(
        function() {

            printWindow.focus();

            printWindow.print();

        },
        500
    );

}


/* =========================================================
   11. SEARCH EVENT
========================================================= */

const searchInput =
    document.getElementById(
        "search"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            loadReport();

        }
    );

}


/* =========================================================
   12. PAGE INITIALIZATION
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function() {

            loadReport();

        }
    );

}
else {

    loadReport();

}


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM Wadi Report loaded successfully."
);
