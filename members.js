/* =========================================================
   members.js
   CORRECTED FINAL VERSION
   मोर्डे ग्राम विकास मंडळ, मुंबई

   Features:
   ✅ New Member Save
   ✅ Auto MGVM Member ID
   ✅ Duplicate Name / Mobile Check
   ✅ Member Photo
   ✅ LocalStorage
   ✅ Search
   ✅ Wadi Filter
   ✅ Member List
   ✅ Edit
   ✅ Delete
   ✅ Excel / CSV Import
   ✅ Excel मधील बाकी वर्गणी Import
   ✅ Excel Export
   ✅ Print
   ✅ Dashboard Member Count
   ✅ Subscription Compatible
========================================================= */


/* =========================================================
   1. GLOBAL DATA
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
            "Members Load Error:",
            error
        );

        members = [];

    }

}


/* =========================================================
   3. DOM ELEMENTS
========================================================= */

const memberForm =
    document.getElementById("memberForm");

const memberTableBody =
    document.getElementById("memberTableBody");

const memberId =
    document.getElementById("memberId");

const memberName =
    document.getElementById("memberName");

const mobile =
    document.getElementById("mobile");

const wadi =
    document.getElementById("wadi");

const dob =
    document.getElementById("dob");

const address =
    document.getElementById("address");

const photo =
    document.getElementById("photo");

const searchMemberInput =
    document.getElementById("searchMember");

const wadiFilter =
    document.getElementById("wadiFilter");

const importBtn =
    document.getElementById("importBtn");

const exportBtn =
    document.getElementById("exportBtn");

const printBtn =
    document.getElementById("printBtn");

const excelFile =
    document.getElementById("excelFile");


/* =========================================================
   4. SAVE MEMBERS
========================================================= */

function saveMembers() {

    try {

        localStorage.setItem(
            "mgvm_members",
            JSON.stringify(members)
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
   5. NORMALIZE SEARCH TEXT
   Name search problem fix
========================================================= */

function normalizeSearchText(value) {

    return String(value || "")
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

}


/* =========================================================
   6. GET NEXT MEMBER ID
========================================================= */

function generateNextMemberId() {

    let maxNumber = 0;

    members.forEach(
        function(member) {

            const id =
                String(member.id || "");

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

                    maxNumber = number;

                }

            }

        }
    );

    return (
        "MGVM-" +
        String(maxNumber + 1)
            .padStart(4, "0")
    );

}


/* =========================================================
   7. DISPLAY NEXT MEMBER ID
========================================================= */

function generateMemberId() {

    if (!memberId) return;

    memberId.value =
        generateNextMemberId();

}


/* =========================================================
   8. IMAGE TO BASE64
========================================================= */

function imageToBase64(file) {

    return new Promise(
        function(resolve) {

            if (!file) {

                resolve("");

                return;

            }

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };

            reader.onerror =
                function() {

                    resolve("");

                };

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   9. TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

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
   10. RESET FORM
========================================================= */

function resetMemberForm() {

    if (memberForm) {

        memberForm.reset();

        delete memberForm.dataset.editingId;

    }

    generateMemberId();

}


/* =========================================================
   11. SAVE / UPDATE MEMBER
========================================================= */

if (memberForm) {

    memberForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            loadMembers();

            const editingId =
                memberForm.dataset.editingId || "";

            const name =
                memberName
                    ? memberName.value.trim()
                    : "";

            const mobileNumber =
                mobile
                    ? mobile.value.trim()
                    : "";

            const wadiName =
                wadi
                    ? wadi.value.trim()
                    : "";

            const birthDate =
                dob
                    ? dob.value
                    : "";

            const memberAddress =
                address
                    ? address.value.trim()
                    : "";


            /* NAME REQUIRED */

            if (!name) {

                alert(
                    "कृपया सभासदाचे नाव लिहा."
                );

                return;

            }


            const normalizedName =
                normalizeSearchText(name);


            /* =================================================
               EDIT MEMBER
            ================================================= */

            if (editingId) {

                const memberIndex =
                    members.findIndex(
                        function(item) {

                            return (
                                String(item.id) ===
                                String(editingId)
                            );

                        }
                    );

                if (memberIndex === -1) {

                    alert(
                        "सभासद सापडला नाही."
                    );

                    return;

                }


                /* Duplicate Name */

                const duplicateName =
                    members.some(
                        function(item) {

                            return (
                                String(item.id) !==
                                String(editingId) &&

                                normalizeSearchText(
                                    item.name
                                ) ===
                                normalizedName
                            );

                        }
                    );


                if (duplicateName) {

                    alert(
                        "हे नाव दुसऱ्या सभासदासाठी वापरले आहे."
                    );

                    return;

                }


                /* Duplicate Mobile */

                if (mobileNumber !== "") {

                    const duplicateMobile =
                        members.some(
                            function(item) {

                                return (
                                    String(item.id) !==
                                    String(editingId) &&

                                    String(
                                        item.mobile || ""
                                    )
                                    .trim() ===
                                    mobileNumber
                                );

                            }
                        );


                    if (duplicateMobile) {

                        alert(
                            "हा मोबाईल नंबर दुसऱ्या सभासदासाठी वापरलेला आहे."
                        );

                        return;

                    }

                }


                /* PHOTO */

                if (
                    photo &&
                    photo.files &&
                    photo.files[0]
                ) {

                    members[memberIndex].photo =
                        await imageToBase64(
                            photo.files[0]
                        );

                }


                members[memberIndex].name =
                    name;

                members[memberIndex].mobile =
                    mobileNumber;

                members[memberIndex].wadi =
                    wadiName;

                members[memberIndex].dob =
                    birthDate;

                members[memberIndex].address =
                    memberAddress;


                saveMembers();

                showToast(
                    "सभासदाची माहिती Update झाली."
                );

                displayMembers();

                updateDashboardMemberCount();

                resetMemberForm();

                return;

            }


            /* =================================================
               NEW MEMBER
            ================================================= */


            /* Duplicate Name */

            const duplicateName =
                members.some(
                    function(member) {

                        return (
                            normalizeSearchText(
                                member.name
                            ) ===
                            normalizedName
                        );

                    }
                );


            if (duplicateName) {

                alert(
                    "हा सभासद आधीपासून नोंदणीकृत आहे."
                );

                return;

            }


            /* Duplicate Mobile */

            if (mobileNumber !== "") {

                const duplicateMobile =
                    members.some(
                        function(member) {

                            return (
                                String(
                                    member.mobile || ""
                                )
                                .trim() ===
                                mobileNumber
                            );

                        }
                    );


                if (duplicateMobile) {

                    alert(
                        "हा मोबाईल नंबर आधीच नोंदणीकृत आहे."
                    );

                    return;

                }

            }


            /* PHOTO */

            const photoData =
                await imageToBase64(
                    photo &&
                    photo.files
                        ? photo.files[0]
                        : null
                );


            /* CREATE MEMBER */

            const newMember = {

                id:
                    generateNextMemberId(),

                name:
                    name,

                mobile:
                    mobileNumber,

                wadi:
                    wadiName,

                dob:
                    birthDate,

                address:
                    memberAddress,

                photo:
                    photoData,

                subscriptionPending:
                    0,

                subscriptionPayments:
                    [],

                createdDate:
                    new Date()
                        .toLocaleDateString(
                            "mr-IN"
                        )

            };


            members.push(
                newMember
            );


            if (saveMembers()) {

                displayMembers();

                updateDashboardMemberCount();

                showToast(
                    "सभासद यशस्वीरित्या जतन झाला."
                );

                resetMemberForm();

            }

        }
    );

}


/* =========================================================
   12. DISPLAY MEMBERS
========================================================= */

function displayMembers(list = members) {

    if (!memberTableBody) return;

    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {

        memberTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    अद्याप कोणताही सभासद उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    memberTableBody.innerHTML = "";


    list.forEach(
        function(member) {

            const row =
                document.createElement("tr");


            let photoHTML =
                `<span>👤</span>`;


            if (member.photo) {

                photoHTML = `

                    <img
                        src="${escapeHTML(
                            member.photo
                        )}"
                        alt="Photo"
                        style="
                            width:45px;
                            height:45px;
                            object-fit:cover;
                            border-radius:50%;
                            cursor:pointer;
                        "
                    >

                `;

            }


            const pending =
                Number(
                    member.subscriptionPending
                ) || 0;


            row.innerHTML = `

                <td>
                    ${photoHTML}
                </td>

                <td>
                    ${escapeHTML(member.id)}
                </td>

                <td>
                    ${escapeHTML(member.name)}
                </td>

                <td>
                    ${escapeHTML(member.wadi)}
                </td>

                <td>
                    ${escapeHTML(member.mobile)}
                </td>

                <td>
                    ₹${pending.toLocaleString("en-IN")}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-primary"
                    >
                        <i class="fa fa-edit"></i>
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger"
                    >
                        <i class="fa fa-trash"></i>
                        Delete
                    </button>

                </td>

            `;


            const buttons =
                row.querySelectorAll("button");


            if (buttons[0]) {

                buttons[0].addEventListener(
                    "click",
                    function() {

                        editMember(
                            member.id
                        );

                    }
                );

            }


            if (buttons[1]) {

                buttons[1].addEventListener(
                    "click",
                    function() {

                        deleteMember(
                            member.id
                        );

                    }
                );

            }


            const image =
                row.querySelector("img");


            if (image) {

                image.addEventListener(
                    "click",
                    function() {

                        previewPhoto(
                            member.photo
                        );

                    }
                );

            }


            memberTableBody.appendChild(row);

        }
    );

}


/* =========================================================
   13. SEARCH MEMBERS
   IMPORTANT FIX
========================================================= */

function searchMembers() {

    /*
       प्रत्येक search वेळी latest localStorage
       data load केला जातो.
    */

    loadMembers();


    const keyword =
        searchMemberInput
            ? normalizeSearchText(
                searchMemberInput.value
            )
            : "";


    const selectedWadi =
        wadiFilter
            ? String(
                wadiFilter.value || ""
            ).trim()
            : "";


    const filtered =
        members.filter(
            function(member) {

                const name =
                    normalizeSearchText(
                        member.name
                    );

                const mobileNumber =
                    normalizeSearchText(
                        member.mobile
                    );

                const id =
                    normalizeSearchText(
                        member.id
                    );

                const memberWadi =
                    String(
                        member.wadi || ""
                    ).trim();


                /*
                   Name / Mobile / ID search
                */

                const searchMatch =
                    !keyword ||

                    name.includes(
                        keyword
                    ) ||

                    mobileNumber.includes(
                        keyword
                    ) ||

                    id.includes(
                        keyword
                    );


                /*
                   Wadi filter
                */

                const wadiMatch =
                    !selectedWadi ||

                    memberWadi ===
                    selectedWadi;


                return (
                    searchMatch &&
                    wadiMatch
                );

            }
        );


    displayMembers(
        filtered
    );

}


/* =========================================================
   14. SEARCH EVENTS
========================================================= */

if (searchMemberInput) {

    searchMemberInput.addEventListener(
        "input",
        searchMembers
    );

    searchMemberInput.addEventListener(
        "keyup",
        searchMembers
    );

}


if (wadiFilter) {

    wadiFilter.addEventListener(
        "change",
        searchMembers
    );

}


/* =========================================================
   15. PHOTO PREVIEW
========================================================= */

function previewPhoto(src) {

    const modal =
        document.getElementById(
            "photoModal"
        );

    const image =
        document.getElementById(
            "previewImage"
        );


    if (!modal || !image) return;


    image.src = src;

    modal.style.display =
        "block";

}


/* =========================================================
   16. CLOSE PHOTO MODAL
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList &&
            event.target.classList.contains(
                "close"
            )
        ) {

            const modal =
                document.getElementById(
                    "photoModal"
                );

            if (modal) {

                modal.style.display =
                    "none";

            }

        }

    }
);


window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "photoModal"
            );

        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


/* =========================================================
   17. EDIT MEMBER
========================================================= */

function editMember(id) {

    loadMembers();


    const member =
        members.find(
            function(item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );


    if (!member) {

        alert(
            "सभासद सापडला नाही."
        );

        return;

    }


    if (memberId)
        memberId.value =
            member.id || "";


    if (memberName)
        memberName.value =
            member.name || "";


    if (mobile)
        mobile.value =
            member.mobile || "";


    if (wadi)
        wadi.value =
            member.wadi || "";


    if (dob)
        dob.value =
            member.dob || "";


    if (address)
        address.value =
            member.address || "";


    if (memberForm) {

        memberForm.dataset.editingId =
            member.id;

    }


    showToast(
        "सभासदाची माहिती Edit करण्यासाठी Form मध्ये भरली आहे."
    );


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =========================================================
   18. DELETE MEMBER
========================================================= */

function deleteMember(id) {

    loadMembers();


    const member =
        members.find(
            function(item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );


    if (!member) return;


    const confirmDelete =
        confirm(
            "तुम्हाला '" +
            member.name +
            "' हा सभासद Delete करायचा आहे का?"
        );


    if (!confirmDelete) return;


    members =
        members.filter(
            function(item) {

                return (
                    String(item.id) !==
                    String(id)
                );

            }
        );


    saveMembers();

    displayMembers();

    generateMemberId();

    updateDashboardMemberCount();


    showToast(
        "सभासद Delete झाला."
    );

}


/* =========================================================
   19. EXCEL IMPORT
========================================================= */

if (
    importBtn &&
    excelFile
) {

    importBtn.addEventListener(
        "click",
        function() {

            excelFile.click();

        }
    );


    excelFile.addEventListener(
        "change",
        handleExcelImport
    );

}


/* =========================================================
   20. HANDLE EXCEL IMPORT
========================================================= */

async function handleExcelImport(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    try {

        showMemberLoader(true);


        if (
            typeof XLSX ===
            "undefined"
        ) {

            alert(
                "Excel Library उपलब्ध नाही."
            );

            return;

        }


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
                "कृपया .xlsx, .xls किंवा .csv file निवडा."
            );

            return;

        }


        const data =
            await readExcelFile(file);


        if (
            !data ||
            !data.length
        ) {

            alert(
                "Excel file मध्ये data उपलब्ध नाही."
            );

            return;

        }


        let importedCount = 0;
        let duplicateCount = 0;
        let invalidCount = 0;


        data.forEach(
            function(row) {

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


                if (
                    !name ||
                    String(name).trim() === ""
                ) {

                    invalidCount++;

                    return;

                }


                const cleanName =
                    String(name).trim();


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


                const cleanMobile =
                    String(
                        mobileNumber || ""
                    ).trim();


                const wadiName =
                    getExcelValue(
                        row,
                        [
                            "वाडी",
                            "Wadi",
                            "wadi"
                        ]
                    );


                const cleanWadi =
                    String(
                        wadiName || ""
                    ).trim();


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


                const cleanPending =
                    parsePendingAmount(
                        pendingAmount
                    );


                const duplicateName =
                    members.some(
                        function(member) {

                            return (
                                normalizeSearchText(
                                    member.name
                                ) ===
                                normalizeSearchText(
                                    cleanName
                                )
                            );

                        }
                    );


                if (duplicateName) {

                    duplicateCount++;

                    return;

                }


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
                                    .trim() ===
                                    cleanMobile
                                );

                            }
                        );


                    if (duplicateMobile) {

                        duplicateCount++;

                        return;

                    }

                }


                members.push({

                    id:
                        generateNextMemberId(),

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
                        String(
                            memberAddress || ""
                        ).trim(),

                    photo:
                        "",

                    subscriptionPending:
                        cleanPending,

                    subscriptionPayments:
                        [],

                    createdDate:
                        new Date()
                            .toLocaleDateString(
                                "mr-IN"
                            )

                });


                importedCount++;

            }
        );


        saveMembers();

        displayMembers();

        generateMemberId();

        updateDashboardMemberCount();


        alert(
            "Excel Import पूर्ण झाला.\n\n" +

            "✅ नवीन सभासद: " +
            importedCount +

            "\n⚠️ Duplicate: " +
            duplicateCount +

            "\n❌ Invalid: " +
            invalidCount
        );

    }
    catch (error) {

        console.error(
            "Excel Import Error:",
            error
        );

        alert(
            "Excel Import करताना समस्या आली."
        );

    }
    finally {

        showMemberLoader(false);

        event.target.value = "";

    }

}


/* =========================================================
   21. READ EXCEL
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
                                    type: "array",
                                    cellDates: true
                                }
                            );


                        const sheet =
                            workbook.Sheets[
                                workbook.SheetNames[0]
                            ];


                        const rows =
                            XLSX.utils.sheet_to_json(
                                sheet,
                                {
                                    defval: ""
                                }
                            );


                        resolve(rows);

                    }
                    catch (error) {

                        reject(error);

                    }

                };


            reader.onerror =
                function(error) {

                    reject(error);

                };


            reader.readAsArrayBuffer(file);

        }
    );

}


/* =========================================================
   22. GET EXCEL VALUE
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


    const keys =
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
            j < keys.length;
            j++
        ) {

            const actual =
                normalizeExcelHeader(
                    keys[j]
                );


            if (
                actual === wanted
            ) {

                return row[keys[j]];

            }

        }

    }


    return "";

}


/* =========================================================
   23. NORMALIZE EXCEL HEADER
========================================================= */

function normalizeExcelHeader(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/_/g, "");

}


/* =========================================================
   24. PARSE PENDING
========================================================= */

function parsePendingAmount(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    if (
        typeof value === "number"
    ) {

        return isNaN(value)
            ? 0
            : Number(value);

    }


    const text =
        String(value)
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .replace(/\s/g, "")
            .trim();


    const amount =
        Number(text);


    return isNaN(amount)
        ? 0
        : amount;

}


/* =========================================================
   25. NORMALIZE EXCEL DATE
========================================================= */

function normalizeExcelDate(value) {

    if (!value) return "";


    if (
        value instanceof Date &&
        !isNaN(value.getTime())
    ) {

        return (
            value.getFullYear() +
            "-" +
            String(
                value.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                value.getDate()
            ).padStart(2, "0")
        );

    }


    const text =
        String(value).trim();


    if (
        /^\d{4}-\d{1,2}-\d{1,2}$/
            .test(text)
    ) {

        const parts =
            text.split("-");


        return (
            parts[0] +
            "-" +
            String(parts[1])
                .padStart(2, "0") +
            "-" +
            String(parts[2])
                .padStart(2, "0")
        );

    }


    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/
            .test(text)
    ) {

        const parts =
            text.split("/");


        return (
            parts[2] +
            "-" +
            String(parts[1])
                .padStart(2, "0") +
            "-" +
            String(parts[0])
                .padStart(2, "0")
        );

    }


    if (
        /^\d{1,2}-\d{1,2}-\d{4}$/
            .test(text)
    ) {

        const parts =
            text.split("-");


        return (
            parts[2] +
            "-" +
            String(parts[1])
                .padStart(2, "0") +
            "-" +
            String(parts[0])
                .padStart(2, "0")
        );

    }


    return text;

}


/* =========================================================
   26. EXPORT
========================================================= */

if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        exportMembersToExcel
    );

}


function exportMembersToExcel() {

    loadMembers();


    if (!members.length) {

        alert(
            "Export करण्यासाठी कोणताही सभासद उपलब्ध नाही."
        );

        return;

    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Excel Library उपलब्ध नाही."
        );

        return;

    }


    const exportData =
        members.map(
            function(member) {

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
                        Number(
                            member.subscriptionPending
                        ) || 0,

                    "नोंदणी तारीख":
                        member.createdDate || ""

                };

            }
        );


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


/* =========================================================
   27. PRINT
========================================================= */

if (printBtn) {

    printBtn.addEventListener(
        "click",
        printMemberList
    );

}


function printMemberList() {

    loadMembers();


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


    const searchText =
        searchMemberInput
            ? normalizeSearchText(
                searchMemberInput.value
            )
            : "";


    const selectedWadi =
        wadiFilter
            ? String(
                wadiFilter.value || ""
            ).trim()
            : "";


    const printMembers =
        members.filter(
            function(member) {

                const name =
                    normalizeSearchText(
                        member.name
                    );

                const mobileNumber =
                    normalizeSearchText(
                        member.mobile
                    );

                const id =
                    normalizeSearchText(
                        member.id
                    );


                const searchMatch =
                    !searchText ||

                    name.includes(
                        searchText
                    ) ||

                    mobileNumber.includes(
                        searchText
                    ) ||

                    id.includes(
                        searchText
                    );


                const wadiMatch =
                    !selectedWadi ||
                    String(
                        member.wadi || ""
                    ).trim() ===
                    selectedWadi;


                return (
                    searchMatch &&
                    wadiMatch
                );

            }
        );


    if (!printMembers.length) {

        alert(
            "Matching सभासद उपलब्ध नाहीत."
        );

        printWindow.close();

        return;

    }


    let rows = "";


    printMembers.forEach(
        function(member, index) {

            const pending =
                Number(
                    member.subscriptionPending
                ) || 0;


            rows += `

                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${escapeHTML(member.id)}
                    </td>

                    <td>
                        ${escapeHTML(member.name)}
                    </td>

                    <td>
                        ${escapeHTML(member.wadi)}
                    </td>

                    <td>
                        ${escapeHTML(member.mobile)}
                    </td>

                    <td>
                        ₹${pending.toLocaleString("en-IN")}
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
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }

                h1,
                h2 {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #333;
                    padding: 8px;
                    text-align: center;
                }

                th {
                    background: #eeeeee;
                }

                @media print {

                    @page {
                        size: landscape;
                        margin: 10mm;
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

            <p style="text-align:center;">

                एकूण सभासद:
                ${printMembers.length}

                &nbsp; | &nbsp;

                तारीख:
                ${new Date()
                    .toLocaleDateString("mr-IN")}

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
   28. DASHBOARD MEMBER COUNT
========================================================= */

function updateDashboardMemberCount() {

    loadMembers();


    const totalMembers =
        document.getElementById(
            "totalMembers"
        );


    if (totalMembers) {

        totalMembers.innerText =
            members.length;

    }

}


/* =========================================================
   29. LOADER
========================================================= */

function showMemberLoader(show) {

    const loader =
        document.getElementById(
            "loader"
        );


    if (!loader) return;


    loader.style.display =
        show
            ? "flex"
            : "none";

}


/* =========================================================
   30. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   31. PAGE INITIALIZATION
========================================================= */

function initializeMembersPage() {

    loadMembers();

    generateMemberId();

    displayMembers();

    updateDashboardMemberCount();

}


/* =========================================================
   32. DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMembersPage
    );

}
else {

    initializeMembersPage();

}


/* =========================================================
   FINAL
========================================================= */

console.log(
    "MGVM Corrected members.js loaded successfully."
);
