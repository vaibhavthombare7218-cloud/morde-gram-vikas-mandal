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
   members.js - Part 4
   Excel / CSV Import
   मोर्डे ग्राम विकास मंडळ, मुंबई
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
                "कृपया फक्त Excel (.xlsx/.xls) किंवा CSV file निवडा."
            );

            return;

        }


        /* =========================================
           Read File
        ========================================= */

        const data =
            await readExcelFile(file);


        if (
            !data ||
            !data.length
        ) {

            alert(
                "Excel file मध्ये कोणताही data उपलब्ध नाही."
            );

            return;

        }


        /* =========================================
           Process Rows
        ========================================= */

        let importedCount = 0;

        let duplicateCount = 0;

        let invalidCount = 0;


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            const row =
                data[i];


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


            const wadiName =
                getExcelValue(
                    row,
                    [
                        "वाडी",
                        "Wadi",
                        "wadi"
                    ]
                );


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


            const memberAddress =
                getExcelValue(
                    row,
                    [
                        "पत्ता",
                        "Address",
                        "address"
                    ]
                );


            /* =====================================
               Name Required
            ===================================== */

            if (
                !name ||
                String(name)
                    .trim() === ""
            ) {

                invalidCount++;

                continue;

            }


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


            /* =====================================
               Duplicate Name Check
            ===================================== */

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


            /* =====================================
               Duplicate Mobile Check
            ===================================== */

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


            /* =====================================
               Generate Member ID
            ===================================== */

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
                   Fallback
                */

                newMemberId =
                    "MGVM-" +
                    String(
                        members.length + 1
                    )
                    .padStart(
                        4,
                        "0"
                    );

            }


            /* =====================================
               Member Object
            ===================================== */

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

                subscriptionPending:
                    0,

                createdDate:
                    new Date()
                        .toLocaleDateString(
                            "mr-IN"
                        )

            };


            /* =====================================
               Add Member
            ===================================== */

            members.push(
                newMember
            );


            importedCount++;

        }


        /* =========================================
           Save Data
        ========================================= */

        saveMembers();


        /* =========================================
           Refresh List
        ========================================= */

        if (
            typeof displayMembers ===
            "function"
        ) {

            displayMembers();

        }


        /* =========================================
           Generate New Member ID
        ========================================= */

        if (
            typeof generateMemberId ===
            "function"
        ) {

            generateMemberId();

        }


        /* =========================================
           Result Message
        ========================================= */

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
            "Excel Import Error:",
            error
        );


        alert(
            "Excel Import करताना error आला.\n" +
            "कृपया Excel headings तपासा."
        );

    }
    finally {

        showMemberLoader(false);


        /*
           Same file पुन्हा select करता यावी
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
        Object.keys(
            row
        );


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
   LOADER
========================================================= */

function showMemberLoader(
    show
) {

    const loader =
        document.getElementById(
            "loader"
        );


    if (!loader) {

        return;

    }


    if (show) {

        loader.style.display =
            "flex";

    }
    else {

        loader.style.display =
            "none";

    }

}


/* =========================================================
   IMPORT COMPLETE
========================================================= */

console.log(
    "MGVM Members Excel Import module loaded."
);
