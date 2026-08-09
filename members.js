/* ============================================
   members.js - Part 1
   Initialization + LocalStorage + Member ID
============================================ */

let members = JSON.parse(localStorage.getItem("mgvm_members")) || [];

const memberForm = document.getElementById("memberForm");
const memberTableBody = document.getElementById("memberTableBody");

const memberId = document.getElementById("memberId");
const memberName = document.getElementById("memberName");
const mobile = document.getElementById("mobile");
const wadi = document.getElementById("wadi");
const dob = document.getElementById("dob");
const address = document.getElementById("address");
const photo = document.getElementById("photo");

const searchMember = document.getElementById("searchMember");
const wadiFilter = document.getElementById("wadiFilter");

/* ============================================
   Auto Member ID
============================================ */

function generateMemberId(){

    let next = members.length + 1;

    memberId.value =
    "MGVM-" +
    String(next).padStart(4,"0");

}

/* ============================================
   Save LocalStorage
============================================ */

function saveMembers(){

    localStorage.setItem(
        "mgvm_members",
        JSON.stringify(members)
    );

}

/* ============================================
   Image To Base64
============================================ */

function imageToBase64(file){

    return new Promise((resolve)=>{

        if(!file){

            resolve("");

            return;

        }

        const reader = new FileReader();

        reader.onload = e=>{

            resolve(e.target.result);

        };

        reader.readAsDataURL(file);

    });

}

/* ============================================
   Reset Form
============================================ */

function resetMemberForm(){

    memberForm.reset();

    generateMemberId();

}

/* ============================================
   Page Load
============================================ */

window.onload = function(){

    generateMemberId();

    displayMembers();

};

/* ============================================
   members.js - Part 2
   Save Member + Duplicate Validation
============================================ */

memberForm.addEventListener("submit", async function(e){

    e.preventDefault();

    /* Duplicate Check */

    const duplicate = members.find(m =>
        m.name.trim().toLowerCase() ===
        memberName.value.trim().toLowerCase()
    );

    if(duplicate){

        alert("हा सभासद आधीपासून नोंदणीकृत आहे.");

        return;

    }

    /* Photo */

    const photoData = await imageToBase64(
        photo.files[0]
    );

    /* Member Object */

    const member = {

        id: memberId.value,

        name: memberName.value.trim(),

        mobile: mobile.value.trim(),

        wadi: wadi.value,

        dob: dob.value,

        address: address.value.trim(),

        photo: photoData,

        subscriptionPending: 0,

        createdDate: new Date().toLocaleDateString("mr-IN")

    };

    members.push(member);

    saveMembers();

    displayMembers();

    showToast("सभासद यशस्वीरित्या जतन झाला.");

    resetMemberForm();

});

/* ============================================
   Toast Message
============================================ */

function showToast(message){

    const toast =
    document.getElementById("toast");

    if(!toast){

        alert(message);

        return;

    }

    toast.innerHTML = message;

    toast.style.display = "block";

    setTimeout(function(){

        toast.style.display = "none";

    },2500);

}
/* ============================================
   members.js - Part 3B
   Search + Wadi Filter + Photo Preview
============================================ */

/* ============================================
   Search Member
============================================ */

function searchMembers() {

    const keyword = searchMember.value
        .trim()
        .toLowerCase();

    const filtered = members.filter(member => {

        return (
            member.name.toLowerCase().includes(keyword) ||

            (member.mobile &&
             member.mobile.includes(keyword)) ||

            (member.id &&
             member.id.toLowerCase().includes(keyword))

        );

    });

    displayMembers(filtered);

}

/* ============================================
   Wadi Filter
============================================ */

function filterMembersByWadi() {

    const selected = wadiFilter.value;

    if (selected === "") {

        displayMembers();

        return;

    }

    const filtered = members.filter(member =>
        member.wadi === selected
    );

    displayMembers(filtered);

}

/* ============================================
   Live Events
============================================ */

if (searchMember) {

    searchMember.addEventListener(
        "keyup",
        searchMembers
    );

}

if (wadiFilter) {

    wadiFilter.addEventListener(
        "change",
        filterMembersByWadi
    );

}

/* ============================================
   Photo Preview
============================================ */

function previewPhoto(src) {

    const modal =
    document.getElementById("photoModal");

    const image =
    document.getElementById("previewImage");

    if (!modal || !image) return;

    image.src = src;

    modal.style.display = "block";

}

/* ============================================
   Close Modal
============================================ */

const closeBtn =
document.querySelector(".close");

if (closeBtn) {

    closeBtn.onclick = function () {

        document.getElementById(
            "photoModal"
        ).style.display = "none";

    };

}

window.onclick = function (event) {

    const modal =
    document.getElementById("photoModal");

    if (event.target === modal) {

        modal.style.display = "none";

    }

};

/* ============================================
   members.js - Part 3C
   Excel Import + Excel Export + Print
   Dashboard Sync + Final Initialization
============================================ */


/* ============================================
   Excel Import Button
============================================ */

const importBtn =
    document.getElementById("importBtn");

const excelFile =
    document.getElementById("excelFile");


if (importBtn && excelFile) {

    importBtn.addEventListener("click", function () {

        excelFile.click();

    });

}


/* ============================================
   Excel File Import
============================================ */

if (excelFile) {

    excelFile.addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (!file) return;

        if (typeof XLSX === "undefined") {

            alert(
                "Excel Library उपलब्ध नाही. कृपया Internet Connection तपासा."
            );

            return;

        }

        const reader = new FileReader();

        reader.onload = function (e) {

            try {

                const data =
                    new Uint8Array(e.target.result);

                const workbook =
                    XLSX.read(data, {
                        type: "array"
                    });

                const firstSheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];

                const rows =
                    XLSX.utils.sheet_to_json(
                        firstSheet,
                        {
                            defval: ""
                        }
                    );

                if (!rows.length) {

                    alert(
                        "Excel मध्ये कोणताही डेटा सापडला नाही."
                    );

                    return;

                }

                let importedCount = 0;

                rows.forEach(function (row) {

                    /*
                       Excel Column Names

                       Name / नाव
                       Mobile / मोबाईल
                       Wadi / वाडी
                       DOB / जन्मतारीख
                       Address / पत्ता
                    */

                    const name =
                        String(
                            row["Name"] ||
                            row["नाव"] ||
                            row["सभासद नाव"] ||
                            ""
                        ).trim();

                    if (!name) return;


                    const mobileNumber =
                        String(
                            row["Mobile"] ||
                            row["मोबाईल"] ||
                            row["मोबाईल नंबर"] ||
                            ""
                        ).trim();


                    const wadiName =
                        String(
                            row["Wadi"] ||
                            row["वाडी"] ||
                            ""
                        ).trim();


                    const birthDate =
                        String(
                            row["DOB"] ||
                            row["जन्मतारीख"] ||
                            ""
                        ).trim();


                    const memberAddress =
                        String(
                            row["Address"] ||
                            row["पत्ता"] ||
                            ""
                        ).trim();


                    /*
                       Duplicate Check
                    */

                    const duplicate =
                        members.some(function (member) {

                            return (
                                member.name
                                    .trim()
                                    .toLowerCase() ===
                                name.toLowerCase()
                            );

                        });


                    if (duplicate) return;


                    /*
                       Generate New Member ID
                    */

                    const newId =
                        generateNextMemberId();


                    /*
                       Create Member
                    */

                    const newMember = {

                        id: newId,

                        name: name,

                        mobile: mobileNumber,

                        wadi: wadiName,

                        dob: birthDate,

                        address: memberAddress,

                        photo: "",

                        subscriptionPending: 0,

                        createdDate:
                            new Date()
                                .toLocaleDateString(
                                    "mr-IN"
                                )

                    };


                    members.push(newMember);

                    importedCount++;

                });


                saveMembers();

                displayMembers();

                generateMemberId();


                alert(
                    importedCount +
                    " सभासद यशस्वीरित्या Import झाले."
                );


            } catch (error) {

                console.error(
                    "Excel Import Error:",
                    error
                );

                alert(
                    "Excel Import करताना समस्या आली."
                );

            }


            /*
               File Input Reset
            */

            excelFile.value = "";

        };


        reader.readAsArrayBuffer(file);

    });

}


/* ============================================
   Generate Next Member ID
============================================ */

function generateNextMemberId() {

    let maxNumber = 0;


    members.forEach(function (member) {

        if (!member.id) return;

        const match =
            String(member.id)
                .match(/MGVM-(\d+)/i);

        if (match) {

            const number =
                parseInt(
                    match[1],
                    10
                );

            if (number > maxNumber) {

                maxNumber = number;

            }

        }

    });


    return (
        "MGVM-" +
        String(maxNumber + 1)
            .padStart(4, "0")
    );

}


/* ============================================
   Excel Export
============================================ */

const exportBtn =
    document.getElementById("exportBtn");


if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        exportMembersToExcel
    );

}


function exportMembersToExcel() {

    if (!members.length) {

        alert(
            "Export करण्यासाठी कोणताही सभासद उपलब्ध नाही."
        );

        return;

    }


    if (typeof XLSX === "undefined") {

        alert(
            "Excel Library उपलब्ध नाही."
        );

        return;

    }


    const exportData =
        members.map(function (member) {

            return {

                "Member ID":
                    member.id || "",

                "सभासद नाव":
                    member.name || "",

                "मोबाईल":
                    member.mobile || "",

                "वाडी":
                    member.wadi || "",

                "जन्मतारीख":
                    member.dob || "",

                "पत्ता":
                    member.address || "",

                "बाकी वर्गणी":
                    member.subscriptionPending || 0,

                "नोंदणी तारीख":
                    member.createdDate || ""

            };

        });


    const worksheet =
        XLSX.utils.json_to_sheet(
            exportData
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "सभासद"
    );


    XLSX.writeFile(
        workbook,
        "MGVM_Members.xlsx"
    );


    showToast(
        "सभासदांची Excel फाईल तयार झाली."
    );

}


/* ============================================
   Print Member List
============================================ */

const printBtn =
    document.getElementById("printBtn");


if (printBtn) {

    printBtn.addEventListener(
        "click",
        printMemberList
    );

}


function printMemberList() {

    if (!members.length) {

        alert(
            "Print करण्यासाठी सभासद उपलब्ध नाहीत."
        );

        return;

    }


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


    let rows = "";


    members.forEach(
        function (member, index) {

            rows += `

            <tr>

                <td>${index + 1}</td>

                <td>
                    ${member.id || ""}
                </td>

                <td>
                    ${member.name || ""}
                </td>

                <td>
                    ${member.wadi || ""}
                </td>

                <td>
                    ${member.mobile || ""}
                </td>

                <td>
                    ₹${member.subscriptionPending || 0}
                </td>

            </tr>

            `;

        }
    );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="mr">

        <head>

            <meta charset="UTF-8">

            <title>
                MGVM सभासद यादी
            </title>

            <style>

                body {

                    font-family:
                    "Noto Sans Devanagari",
                    Arial,
                    sans-serif;

                    padding: 20px;

                }

                h1 {

                    text-align: center;

                }

                p {

                    text-align: center;

                }

                table {

                    width: 100%;

                    border-collapse:
                    collapse;

                    margin-top: 25px;

                }

                th,
                td {

                    border:
                    1px solid #333;

                    padding: 8px;

                    text-align: center;

                }

                th {

                    background:
                    #eeeeee;

                }

                @media print {

                    button {

                        display: none;

                    }

                }

            </style>

        </head>


        <body>

            <h1>
                मोर्डे ग्राम विकास मंडळ, मुंबई
            </h1>

            <p>
                सभासद यादी
            </p>

            <table>

                <thead>

                    <tr>

                        <th>क्र.</th>

                        <th>Member ID</th>

                        <th>नाव</th>

                        <th>वाडी</th>

                        <th>मोबाईल</th>

                        <th>बाकी वर्गणी</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* ============================================
   Dashboard Member Count Update
============================================ */

function updateDashboardMemberCount() {

    const totalMembers =
        document.getElementById(
            "totalMembers"
        );


    if (totalMembers) {

        totalMembers.innerText =
            members.length;

    }

}


/* ============================================
   Final Refresh
============================================ */

function refreshMemberPage() {

    displayMembers();

    generateMemberId();

    updateDashboardMemberCount();

}


/* ============================================
   Final Page Initialization
============================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        refreshMemberPage();

    }
);

/* =========================================================
   members.js - Part 4 UPDATED
   Excel / CSV Import
   Includes:
   Name
   Mobile
   Wadi
   DOB
   Address
   Pending Subscription
========================================================= */


/* =========================================================
   EXCEL IMPORT ELEMENTS
========================================================= */

const importBtn =
    document.getElementById("importBtn");

const excelFile =
    document.getElementById("excelFile");


/* =========================================================
   IMPORT BUTTON
========================================================= */

if (importBtn) {

    importBtn.addEventListener(
        "click",
        function () {

            if (excelFile) {

                excelFile.click();

            }

        }
    );

}


/* =========================================================
   FILE SELECTED
========================================================= */

if (excelFile) {

    excelFile.addEventListener(
        "change",
        handleExcelImport
    );

}


/* =========================================================
   HANDLE EXCEL IMPORT
========================================================= */

async function handleExcelImport(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    try {

        showMemberLoader(true);


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            extension !== "xlsx" &&
            extension !== "xls" &&
            extension !== "csv"
        ) {

            alert(
                "कृपया Excel (.xlsx/.xls) किंवा CSV file निवडा."
            );

            return;

        }


        /* =================================================
           Read Excel
        ================================================= */

        const data =
            await readExcelFile(file);


        if (
            !data ||
            data.length === 0
        ) {

            alert(
                "Excel file मध्ये data उपलब्ध नाही."
            );

            return;

        }


        /* =================================================
           Counters
        ================================================= */

        let importedCount = 0;

        let duplicateCount = 0;

        let invalidCount = 0;


        /* =================================================
           Process Every Row
        ================================================= */

        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            const row =
                data[i];


            /* =============================================
               NAME
            ============================================= */

            const name =
                getExcelValue(
                    row,
                    [
                        "नाव",
                        "सभासद नाव",
                        "Name",
                        "Member Name",
                        "memberName"
                    ]
                );


            /* =============================================
               MOBILE
            ============================================= */

            const mobileNumber =
                getExcelValue(
                    row,
                    [
                        "मोबाईल",
                        "मोबाईल नंबर",
                        "Mobile",
                        "Mobile Number",
                        "mobile"
                    ]
                );


            /* =============================================
               WADI
            ============================================= */

            const wadiName =
                getExcelValue(
                    row,
                    [
                        "वाडी",
                        "Wadi",
                        "wadi"
                    ]
                );


            /* =============================================
               DOB
            ============================================= */

            const birthDate =
                getExcelValue(
                    row,
                    [
                        "जन्मतारीख",
                        "DOB",
                        "Date of Birth",
                        "Birth Date",
                        "dob"
                    ]
                );


            /* =============================================
               ADDRESS
            ============================================= */

            const memberAddress =
                getExcelValue(
                    row,
                    [
                        "पत्ता",
                        "Address",
                        "address"
                    ]
                );


            /* =============================================
               PENDING SUBSCRIPTION
            ============================================= */

            const pendingAmount =
                getExcelValue(
                    row,
                    [
                        "बाकी वर्गणी",
                        "बाकी",
                        "वर्गणी बाकी",
                        "Pending",
                        "Pending Amount",
                        "Subscription Pending",
                        "subscriptionPending"
                    ]
                );


            /* =============================================
               NAME REQUIRED
            ============================================= */

            if (
                !name ||
                String(name).trim() === ""
            ) {

                invalidCount++;

                continue;

            }


            /* =============================================
               CLEAN VALUES
            ============================================= */

            const cleanName =
                String(name)
                    .trim();


            const cleanMobile =
                String(
                    mobileNumber || ""
                )
                .trim();


            const cleanWadi =
                String(
                    wadiName || ""
                )
                .trim();


            const cleanAddress =
                String(
                    memberAddress || ""
                )
                .trim();


            /* =============================================
               CLEAN PENDING AMOUNT

               Accepts:
               1500
               1,500
               ₹1500
               ₹1,500
            ============================================= */

            const cleanPending =
                parsePendingAmount(
                    pendingAmount
                );


            /* =============================================
               DUPLICATE NAME CHECK
            ============================================= */

            const duplicateName =
                members.some(
                    function(member) {

                        return (
                            String(
                                member.name || ""
                            )
                            .trim()
                            .toLowerCase()
                            ===
                            cleanName
                                .toLowerCase()
                        );

                    }
                );


            if (
                duplicateName
            ) {

                duplicateCount++;

                continue;

            }


            /* =============================================
               DUPLICATE MOBILE CHECK
            ============================================= */

            if (
                cleanMobile !== ""
            ) {

                const duplicateMobile =
                    members.some(
                        function(member) {

                            return (
                                String(
                                    member.mobile || ""
                                )
                                .trim()
                                ===
                                cleanMobile
                            );

                        }
                    );


                if (
                    duplicateMobile
                ) {

                    duplicateCount++;

                    continue;

                }

            }


            /* =============================================
               GENERATE MEMBER ID
            ============================================= */

            let newMemberId;


            if (
                typeof generateMGVMMemberId ===
                "function"
            ) {

                newMemberId =
                    generateMGVMMemberId();

            }
            else {

                /*
                   Fallback ID
                */

                newMemberId =
                    generateImportMemberId();

            }


            /* =============================================
               MEMBER OBJECT
            ============================================= */

            const newMember = {

                id:
                    newMemberId,

                name:
                    cleanName,

                mobile:
                    cleanMobile,

                wadi:
                    cleanWadi,

                dob:
                    normalizeExcelDate(
                        birthDate
                    ),

                address:
                    cleanAddress,

                photo:
                    "",

                /*
                   Excel मधील बाकी वर्गणी
                   येथे save होईल
                */

                subscriptionPending:
                    cleanPending,

                createdDate:
                    new Date()
                        .toLocaleDateString(
                            "mr-IN"
                        )

            };


            /* =============================================
               ADD MEMBER
            ============================================= */

            members.push(
                newMember
            );


            importedCount++;

        }


        /* =================================================
           SAVE
        ================================================= */

        saveMembers();


        /* =================================================
           REFRESH MEMBER LIST
        ================================================= */

        if (
            typeof displayMembers ===
            "function"
        ) {

            displayMembers();

        }


        /* =================================================
           NEW MEMBER ID
        ================================================= */

        if (
            typeof generateMemberId ===
            "function"
        ) {

            generateMemberId();

        }


        /* =================================================
           RESULT
        ================================================= */

        let message =
            "Excel Import पूर्ण झाला.\n\n";


        message +=
            "✅ नवीन सभासद: " +
            importedCount +
            "\n";


        message +=
            "⚠️ Duplicate: " +
            duplicateCount +
            "\n";


        message +=
            "❌ Invalid: " +
            invalidCount;


        alert(message);

    }
    catch (error) {

        console.error(
            "MGVM Excel Import Error:",
            error
        );


        alert(
            "Excel Import करताना error आला.\n\n" +
            "कृपया Excel headings तपासा."
        );

    }
    finally {

        showMemberLoader(false);


        /*
           Same file पुन्हा select करता येईल
        */

        event.target.value = "";

    }

}


/* =========================================================
   READ EXCEL FILE
========================================================= */

function readExcelFile(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    try {

                        const workbook =
                            XLSX.read(
                                event.target.result,
                                {
                                    type:
                                        "array",

                                    cellDates:
                                        true
                                }
                            );


                        const firstSheet =
                            workbook.Sheets[
                                workbook.SheetNames[0]
                            ];


                        const jsonData =
                            XLSX.utils.sheet_to_json(
                                firstSheet,
                                {
                                    defval:
                                        ""
                                }
                            );


                        resolve(
                            jsonData
                        );

                    }
                    catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                function(error) {

                    reject(
                        error
                    );

                };


            reader.readAsArrayBuffer(
                file
            );

        }
    );

}


/* =========================================================
   GET EXCEL VALUE
========================================================= */

function getExcelValue(
    row,
    possibleNames
) {

    if (
        !row ||
        !possibleNames
    ) {

        return "";

    }


    const rowKeys =
        Object.keys(row);


    for (
        let i = 0;
        i < possibleNames.length;
        i++
    ) {

        const wanted =
            normalizeExcelHeader(
                possibleNames[i]
            );


        for (
            let j = 0;
            j < rowKeys.length;
            j++
        ) {

            const actual =
                normalizeExcelHeader(
                    rowKeys[j]
                );


            if (
                actual === wanted
            ) {

                return row[
                    rowKeys[j]
                ];

            }

        }

    }


    return "";

}


/* =========================================================
   NORMALIZE EXCEL HEADER
========================================================= */

function normalizeExcelHeader(
    value
) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase()
    .replace(
        /\s+/g,
        ""
    )
    .replace(
        /_/g,
        ""
    );

}


/* =========================================================
   PARSE PENDING AMOUNT
========================================================= */

function parsePendingAmount(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    /*
       Excel number असल्यास
    */

    if (
        typeof value === "number"
    ) {

        return (
            isNaN(value)
            ?
            0
            :
            Number(value)
        );

    }


    /*
       Text:
       ₹1,500
       1,500
       ₹1500
       1500
    */

    let text =
        String(value)
            .trim();


    text =
        text.replace(
            /₹/g,
            ""
        );


    text =
        text.replace(
            /,/g,
            ""
        );


    text =
        text.replace(
            /\s/g,
            ""
        );


    const amount =
        Number(text);


    if (
        isNaN(amount)
    ) {

        return 0;

    }


    return amount;

}


/* =========================================================
   NORMALIZE EXCEL DATE
========================================================= */

function normalizeExcelDate(
    value
) {

    if (!value) {

        return "";

    }


    /* =====================================
       JavaScript Date
    ===================================== */

    if (
        value instanceof Date &&
        !isNaN(
            value.getTime()
        )
    ) {

        const yyyy =
            value.getFullYear();


        const mm =
            String(
                value.getMonth() + 1
            )
            .padStart(
                2,
                "0"
            );


        const dd =
            String(
                value.getDate()
            )
            .padStart(
                2,
                "0"
            );


        return (
            yyyy +
            "-" +
            mm +
            "-" +
            dd
        );

    }


    const text =
        String(
            value
        )
        .trim();


    /* =====================================
       YYYY-MM-DD
    ===================================== */

    if (
        /^\d{4}-\d{1,2}-\d{1,2}$/
            .test(text)
    ) {

        const parts =
            text.split("-");


        return (
            parts[0] +
            "-" +
            String(
                parts[1]
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                parts[2]
            ).padStart(
                2,
                "0"
            )
        );

    }


    /* =====================================
       DD/MM/YYYY
    ===================================== */

    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/
            .test(text)
    ) {

        const parts =
            text.split("/");


        return (
            parts[2] +
            "-" +
            String(
                parts[1]
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                parts[0]
            ).padStart(
                2,
                "0"
            )
        );

    }


    /* =====================================
       DD-MM-YYYY
    ===================================== */

    if (
        /^\d{1,2}-\d{1,2}-\d{4}$/
            .test(text)
    ) {

        const parts =
            text.split("-");


        return (
            parts[2] +
            "-" +
            String(
                parts[1]
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                parts[0]
            ).padStart(
                2,
                "0"
            )
        );

    }


    return text;

}


/* =========================================================
   FALLBACK MEMBER ID
========================================================= */

function generateImportMemberId() {

    let maxNumber = 0;


    members.forEach(
        function(member) {

            const id =
                String(
                    member.id || ""
                );


            const match =
                id.match(
                    /MGVM-(\d+)/i
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

 
/* =========================================================
   members.js - Part 5
   Excel Export + Print List
   मोर्डे ग्राम विकास मंडळ, मुंबई
========================================================= */


/* =========================================================
   EXPORT BUTTON
========================================================= */

const exportBtn =
    document.getElementById(
        "exportBtn"
    );


if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        exportMembersToExcel
    );

}


/* =========================================================
   PRINT BUTTON
========================================================= */

const printBtn =
    document.getElementById(
        "printBtn"
    );


if (printBtn) {

    printBtn.addEventListener(
        "click",
        printMemberList
    );

}


/* =========================================================
   EXCEL EXPORT
========================================================= */

function exportMembersToExcel() {

    try {

        /*
           नवीनतम Members data घ्या
        */

        members =
            JSON.parse(
                localStorage.getItem(
                    "mgvm_members"
                )
            ) || [];


        if (!members.length) {

            alert(
                "Export करण्यासाठी कोणताही सभासद उपलब्ध नाही."
            );

            return;

        }


        /* =====================================
           Excel Data
        ===================================== */

        const excelData =
            members.map(
                function(member) {

                    let pending = 0;


                    /*
                       Member pending उपलब्ध असल्यास
                       ते वापरायचे
                    */

                    if (
                        Number(
                            member.subscriptionPending
                        ) > 0
                    ) {

                        pending =
                            Number(
                                member.subscriptionPending
                            );

                    }


                    return {

                        "Member ID":
                            member.id || "",

                        "नाव":
                            member.name || "",

                        "मोबाईल":
                            member.mobile || "",

                        "वाडी":
                            member.wadi || "",

                        "जन्मतारीख":
                            member.dob || "",

                        "पत्ता":
                            member.address || "",

                        "बाकी वर्गणी":
                            pending

                    };

                }
            );


        /* =====================================
           Create Worksheet
        ===================================== */

        const worksheet =
            XLSX.utils.json_to_sheet(
                excelData
            );


        /* =====================================
           Column Width
        ===================================== */

        worksheet["!cols"] = [

            {
                wch: 15
            },

            {
                wch: 25
            },

            {
                wch: 15
            },

            {
                wch: 25
            },

            {
                wch: 15
            },

            {
                wch: 35
            },

            {
                wch: 15
            }

        ];


        /* =====================================
           Create Workbook
        ===================================== */

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "सभासद यादी"
        );


        /* =====================================
           File Name
        ===================================== */

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


        const fileName =
            "MGVM_Members_" +
            yyyy +
            "-" +
            mm +
            "-" +
            dd +
            ".xlsx";


        /* =====================================
           Download
        ===================================== */

        XLSX.writeFile(
            workbook,
            fileName
        );


        showMemberToast(
            "सभासद यादी Excel मध्ये Export झाली."
        );

    }
    catch (error) {

        console.error(
            "Excel Export Error:",
            error
        );


        alert(
            "Excel Export करताना समस्या आली."
        );

    }

}


/* =========================================================
   PRINT MEMBER LIST
========================================================= */

function printMemberList() {

    members =
        JSON.parse(
            localStorage.getItem(
                "mgvm_members"
            )
        ) || [];


    if (!members.length) {

        alert(
            "Print करण्यासाठी कोणताही सभासद उपलब्ध नाही."
        );

        return;

    }


    /* =====================================
       Current Filter
    ===================================== */

    const searchText =
        document.getElementById(
            "searchMember"
        );


    const wadiSelect =
        document.getElementById(
            "wadiFilter"
        );


    const search =
        searchText
        ?
        searchText.value
            .trim()
            .toLowerCase()
        :
        "";


    const selectedWadi =
        wadiSelect
        ?
        wadiSelect.value
        :
        "";


    let printMembers =
        members.filter(
            function(member) {

                const name =
                    String(
                        member.name || ""
                    )
                    .toLowerCase();


                const mobile =
                    String(
                        member.mobile || ""
                    )
                    .toLowerCase();


                const id =
                    String(
                        member.id || ""
                    )
                    .toLowerCase();


                const searchMatch =
                    !search ||
                    name.includes(search) ||
                    mobile.includes(search) ||
                    id.includes(search);


                const wadiMatch =
                    !selectedWadi ||
                    member.wadi ===
                    selectedWadi;


                return (
                    searchMatch &&
                    wadiMatch
                );

            }
        );


    if (!printMembers.length) {

        alert(
            "Print करण्यासाठी matching सभासद उपलब्ध नाहीत."
        );

        return;

    }


    /* =====================================
       Create Print Window
    ===================================== */

    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Print window उघडता आली नाही. Browser popup permission तपासा."
        );

        return;

    }


    let rows = "";


    printMembers.forEach(
        function(member, index) {

            let pending = 0;


            if (
                Number(
                    member.subscriptionPending
                ) > 0
            ) {

                pending =
                    Number(
                        member.subscriptionPending
                    );

            }


            rows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapePrintHTML(
                            member.id
                        )}
                    </td>

                    <td>
                        ${escapePrintHTML(
                            member.name
                        )}
                    </td>

                    <td>
                        ${escapePrintHTML(
                            member.wadi
                        )}
                    </td>

                    <td>
                        ${escapePrintHTML(
                            member.mobile
                        )}
                    </td>

                    <td>
                        ${escapePrintHTML(
                            member.dob
                        )}
                    </td>

                    <td>
                        ${escapePrintHTML(
                            member.address
                        )}
                    </td>

                    <td>
                        ₹${Number(
                            pending
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </td>

                </tr>

            `;

        }
    );


    /* =====================================
       Print HTML
    ===================================== */

    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="mr">

        <head>

            <meta charset="UTF-8">

            <title>
                सभासद यादी
            </title>


            <style>

                body {

                    font-family:
                        "Noto Sans Devanagari",
                        Arial,
                        sans-serif;

                    padding:
                        20px;

                    color:
                        #000;

                }


                h1 {

                    text-align:
                        center;

                    margin-bottom:
                        5px;

                }


                h2 {

                    text-align:
                        center;

                    margin-top:
                        0;

                    font-size:
                        18px;

                    font-weight:
                        normal;

                }


                .info {

                    text-align:
                        center;

                    margin-bottom:
                        20px;

                    font-size:
                        14px;

                }


                table {

                    width:
                        100%;

                    border-collapse:
                        collapse;

                    font-size:
                        12px;

                }


                th,
                td {

                    border:
                        1px solid #000;

                    padding:
                        6px;

                    text-align:
                        left;

                }


                th {

                    font-weight:
                        bold;

                    background:
                        #f2f2f2;

                }


                .footer {

                    margin-top:
                        20px;

                    text-align:
                        center;

                    font-size:
                        12px;

                }


                @media print {

                    body {

                        padding:
                            5px;

                    }


                    @page {

                        size:
                            landscape;

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

            <h2>
                सभासद यादी
            </h2>


            <div class="info">

                एकूण सभासद:
                <strong>
                    ${printMembers.length}
                </strong>

                &nbsp;&nbsp; | &nbsp;&nbsp;

                तारीख:
                <strong>
                    ${new Date()
                        .toLocaleDateString(
                            "mr-IN"
                        )}
                </strong>

            </div>


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
                            नाव
                        </th>

                        <th>
                            वाडी
                        </th>

                        <th>
                            मोबाईल
                        </th>

                        <th>
                            जन्मतारीख
                        </th>

                        <th>
                            पत्ता
                        </th>

                        <th>
                            बाकी
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="footer">

                © 2026
                मोर्डे ग्राम विकास मंडळ, मुंबई

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();


    /* =====================================
       Start Print
    ===================================== */

    printWindow.focus();


    setTimeout(
        function() {

            printWindow.print();

        },
        500
    );

}


/* =========================================================
   ESCAPE PRINT HTML
========================================================= */

function escapePrintHTML(
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
   TOAST
========================================================= */

function showMemberToast(
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
   MEMBERS.JS PART 5 LOADED
========================================================= */

console.log(
    "MGVM Members Excel Export + Print module loaded."
);
