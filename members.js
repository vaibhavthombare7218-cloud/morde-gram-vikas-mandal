/* =========================================================
   members.js
   COMPLETE CORRECTED FINAL VERSION
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
   ✅ Opening Pending Amount सुरक्षित
   ✅ Excel Export
   ✅ Print
   ✅ Dashboard Member Count

   IMPORTANT:
   openingSubscriptionPending =
   Excel / Existing historical pending amount

   subscriptionPending =
   Current remaining pending amount
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

}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadMembers();


/* =========================================================
   3. DOM ELEMENTS
========================================================= */

const memberForm =
    document.getElementById(
        "memberForm"
    );

const memberTableBody =
    document.getElementById(
        "memberTableBody"
    );

const memberId =
    document.getElementById(
        "memberId"
    );

const memberName =
    document.getElementById(
        "memberName"
    );

const mobile =
    document.getElementById(
        "mobile"
    );

const wadi =
    document.getElementById(
        "wadi"
    );

const dob =
    document.getElementById(
        "dob"
    );

const address =
    document.getElementById(
        "address"
    );

const photo =
    document.getElementById(
        "photo"
    );

const searchMemberInput =
    document.getElementById(
        "searchMember"
    );

const wadiFilter =
    document.getElementById(
        "wadiFilter"
    );

const importBtn =
    document.getElementById(
        "importBtn"
    );

const exportBtn =
    document.getElementById(
        "exportBtn"
    );

const printBtn =
    document.getElementById(
        "printBtn"
    );

const excelFile =
    document.getElementById(
        "excelFile"
    );


/* =========================================================
   4. SAVE MEMBERS
========================================================= */

function saveMembers() {

    try {

        localStorage.setItem(
            "mgvm_members",
            JSON.stringify(
                members
            )
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
   5. GET NEXT MEMBER ID
========================================================= */

function generateNextMemberId() {

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

            }

        }
    );


    return (
        "MGVM-" +
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
   6. DISPLAY NEXT MEMBER ID
========================================================= */

function generateMemberId() {

    if (!memberId) return;

    memberId.value =
        generateNextMemberId();

}


/* =========================================================
   7. IMAGE TO BASE64
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


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   8. TOAST
========================================================= */

function showToast(message) {

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
   9. RESET FORM
========================================================= */

function resetMemberForm() {

    if (memberForm) {

        memberForm.reset();

        memberForm.dataset.editingId =
            "";

    }


    generateMemberId();

}


/* =========================================================
   10. ENSURE MEMBER PENDING STRUCTURE
========================================================= */

function ensureMemberPendingStructure(
    member
) {

    if (!member) return;


    /*
       Old members मध्ये
       openingSubscriptionPending नसेल
       तर existing pending ला opening मानले जाईल.

       Existing subscription payments असल्यास
       opening = current pending + paid amount.
    */

    if (
        member.openingSubscriptionPending ===
        undefined ||
        member.openingSubscriptionPending ===
        null
    ) {

        let paidTotal = 0;


        try {

            const subscriptions =
                JSON.parse(
                    localStorage.getItem(
                        "mgvm_subscriptions"
                    )
                ) || [];


            paidTotal =
                subscriptions
                .filter(
                    function(item) {

                        return (
                            String(
                                item.memberId
                            ) ===
                            String(
                                member.id
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
        catch (error) {

            paidTotal = 0;

        }


        const currentPending =
            Number(
                member.subscriptionPending || 0
            );


        member.openingSubscriptionPending =
            Math.max(
                0,
                currentPending +
                paidTotal
            );

    }


    if (
        member.subscriptionPayments ===
        undefined
    ) {

        member.subscriptionPayments =
            [];

    }

}


/* =========================================================
   11. RECALCULATE MEMBER PENDING
========================================================= */

function recalculateMemberPending(
    memberId
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


    if (index === -1) {

        return 0;

    }


    const member =
        members[index];


    ensureMemberPendingStructure(
        member
    );


    let opening =
        Number(
            member.openingSubscriptionPending
        ) || 0;


    let totalPaid = 0;


    try {

        const subscriptions =
            JSON.parse(
                localStorage.getItem(
                    "mgvm_subscriptions"
                )
            ) || [];


        totalPaid =
            subscriptions
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
    catch (error) {

        totalPaid = 0;

    }


    member.subscriptionPending =
        Math.max(
            0,
            opening -
            totalPaid
        );


    members[index] =
        member;


    saveMembers();


    return (
        member.subscriptionPending
    );

}


/* =========================================================
   12. SAVE NEW MEMBER
========================================================= */

if (memberForm) {

    memberForm.addEventListener(
        "submit",
        async function(event) {

            /*
               Edit mode दुसऱ्या listener मध्ये handle होईल.
            */

            if (
                memberForm.dataset.editingId
            ) {

                return;

            }


            event.preventDefault();


            loadMembers();


            const name =
                memberName
                ?
                memberName.value.trim()
                :
                "";


            const mobileNumber =
                mobile
                ?
                mobile.value.trim()
                :
                "";


            const wadiName =
                wadi
                ?
                wadi.value
                :
                "";


            const birthDate =
                dob
                ?
                dob.value
                :
                "";


            const memberAddress =
                address
                ?
                address.value.trim()
                :
                "";


            if (!name) {

                alert(
                    "कृपया सभासदाचे नाव लिहा."
                );

                return;

            }


            /* =========================================
               DUPLICATE NAME
            ========================================= */

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
                            name.toLowerCase()
                        );

                    }
                );


            if (duplicateName) {

                alert(
                    "हा सभासद आधीपासून नोंदणीकृत आहे."
                );

                return;

            }


            /* =========================================
               DUPLICATE MOBILE
            ========================================= */

            if (
                mobileNumber !== ""
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
                                mobileNumber
                            );

                        }
                    );


                if (
                    duplicateMobile
                ) {

                    alert(
                        "हा मोबाईल नंबर आधीच नोंदणीकृत आहे."
                    );

                    return;

                }

            }


            /* =========================================
               PHOTO
            ========================================= */

            const photoData =
                await imageToBase64(
                    photo &&
                    photo.files
                    ?
                    photo.files[0]
                    :
                    null
                );


            /* =========================================
               NEW MEMBER
            ========================================= */

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

                /*
                   New member ची historical
                   pending सुरुवातीला 0
                */

                openingSubscriptionPending:
                    0,

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


            if (
                saveMembers()
            ) {

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
   13. DISPLAY MEMBERS
========================================================= */

function displayMembers(
    list = members
) {

    if (!memberTableBody) {

        return;

    }


    if (
        !list ||
        list.length === 0
    ) {

        memberTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    align="center"
                >

                    अद्याप कोणताही सभासद उपलब्ध नाही.

                </td>

            </tr>

        `;

        return;

    }


    memberTableBody.innerHTML =
        "";


    list.forEach(
        function(member) {

            const row =
                document.createElement(
                    "tr"
                );


            let photoHTML =
                `<span>👤</span>`;


            if (
                member.photo
            ) {

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
                        onclick="previewPhoto(
                            '${escapeJS(
                                member.photo
                            )}'
                        )"
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
                        member.wadi
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        member.mobile
                    )}
                </td>

                <td>
                    ₹${pending.toLocaleString(
                        "en-IN"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="editMember(
                            '${escapeJS(
                                member.id
                            )}'
                        )"
                    >
                        <i class="fa fa-edit"></i>
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteMember(
                            '${escapeJS(
                                member.id
                            )}'
                        )"
                    >
                        <i class="fa fa-trash"></i>
                        Delete
                    </button>

                </td>

            `;


            memberTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   14. SEARCH MEMBERS
========================================================= */

function searchMembers() {

    const keyword =
        searchMemberInput
        ?
        searchMemberInput.value
            .trim()
            .toLowerCase()
        :
        "";


    const selectedWadi =
        wadiFilter
        ?
        wadiFilter.value
        :
        "";


    const filtered =
        members.filter(
            function(member) {

                const name =
                    String(
                        member.name || ""
                    )
                    .toLowerCase();


                const mobileNumber =
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


                const wadiMatch =
                    !selectedWadi ||
                    String(
                        member.wadi || ""
                    ) ===
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


if (
    searchMemberInput
) {

    searchMemberInput.addEventListener(
        "input",
        searchMembers
    );

}


if (
    wadiFilter
) {

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


    if (
        !modal ||
        !image
    ) {

        return;

    }


    image.src =
        src;


    modal.style.display =
        "block";

}


const closeBtn =
    document.querySelector(
        ".close"
    );


if (closeBtn) {

    closeBtn.addEventListener(
        "click",
        function() {

            const modal =
                document.getElementById(
                    "photoModal"
                );


            if (modal) {

                modal.style.display =
                    "none";

            }

        }
    );

}


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
   16. EDIT MEMBER
========================================================= */

function editMember(
    id
) {

    loadMembers();


    const member =
        members.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
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


    ensureMemberPendingStructure(
        member
    );


    if (memberId) {

        memberId.value =
            member.id;

    }


    if (memberName) {

        memberName.value =
            member.name || "";

    }


    if (mobile) {

        mobile.value =
            member.mobile || "";

    }


    if (wadi) {

        wadi.value =
            member.wadi || "";

    }


    if (dob) {

        dob.value =
            member.dob || "";

    }


    if (address) {

        address.value =
            member.address || "";

    }


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
   17. HANDLE EDIT SUBMIT
========================================================= */

if (memberForm) {

    memberForm.addEventListener(
        "submit",
        async function(event) {

            const editingId =
                memberForm.dataset.editingId;


            if (!editingId) {

                return;

            }


            event.preventDefault();


            loadMembers();


            const member =
                members.find(
                    function(item) {

                        return (
                            String(
                                item.id
                            ) ===
                            String(
                                editingId
                            )
                        );

                    }
                );


            if (!member) {

                memberForm.dataset.editingId =
                    "";

                return;

            }


            const name =
                memberName
                ?
                memberName.value.trim()
                :
                "";


            const mobileNumber =
                mobile
                ?
                mobile.value.trim()
                :
                "";


            if (!name) {

                alert(
                    "सभासदाचे नाव आवश्यक आहे."
                );

                return;

            }


            const duplicateName =
                members.some(
                    function(item) {

                        return (
                            String(
                                item.id
                            ) !==
                            String(
                                editingId
                            ) &&
                            String(
                                item.name || ""
                            )
                            .trim()
                            .toLowerCase()
                            ===
                            name.toLowerCase()
                        );

                    }
                );


            if (
                duplicateName
            ) {

                alert(
                    "हे नाव दुसऱ्या सभासदासाठी वापरले आहे."
                );

                return;

            }


            if (
                mobileNumber !== ""
            ) {

                const duplicateMobile =
                    members.some(
                        function(item) {

                            return (
                                String(
                                    item.id
                                ) !==
                                String(
                                    editingId
                                ) &&
                                String(
                                    item.mobile || ""
                                )
                                .trim()
                                ===
                                mobileNumber
                            );

                        }
                    );


                if (
                    duplicateMobile
                ) {

                    alert(
                        "हा मोबाईल नंबर दुसऱ्या सभासदासाठी वापरलेला आहे."
                    );

                    return;

                }

            }


            if (
                photo &&
                photo.files &&
                photo.files[0]
            ) {

                member.photo =
                    await imageToBase64(
                        photo.files[0]
                    );

            }


            member.name =
                name;

            member.mobile =
                mobileNumber;

            member.wadi =
                wadi
                ?
                wadi.value
                :
                "";

            member.dob =
                dob
                ?
                dob.value
                :
                "";

            member.address =
                address
                ?
                address.value.trim()
                :
                "";


            ensureMemberPendingStructure(
                member
            );


            saveMembers();


            memberForm.dataset.editingId =
                "";


            displayMembers();

            updateDashboardMemberCount();

            resetMemberForm();


            showToast(
                "सभासदाची माहिती Update झाली."
            );

        }
    );

}


/* =========================================================
   18. DELETE MEMBER
========================================================= */

function deleteMember(
    id
) {

    loadMembers();


    const member =
        members.find(
            function(item) {

                return (
                    String(
                        item.id
                    ) ===
                    String(id)
                );

            }
        );


    if (!member) {

        return;

    }


    const confirmDelete =
        confirm(
            "तुम्हाला '" +
            member.name +
            "' हा सभासद Delete करायचा आहे का?\n\n" +
            "या सभासदाच्या subscription transactions delete होणार नाहीत."
        );


    if (!confirmDelete) {

        return;

    }


    members =
        members.filter(
            function(item) {

                return (
                    String(
                        item.id
                    ) !==
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
   19. EXCEL IMPORT BUTTON
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

}


if (
    excelFile
) {

    excelFile.addEventListener(
        "change",
        handleExcelImport
    );

}


/* =========================================================
   20. HANDLE EXCEL IMPORT
========================================================= */

async function handleExcelImport(
    event
) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    try {

        showMemberLoader(
            true
        );


        if (
            typeof XLSX ===
            "undefined"
        ) {

            alert(
                "Excel Library उपलब्ध नाही. Internet Connection तपासा."
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
            await readExcelFile(
                file
            );


        if (
            !data ||
            data.length === 0
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
                    String(
                        name
                    ).trim() === ""
                ) {

                    invalidCount++;

                    return;

                }


                const cleanName =
                    String(
                        name
                    ).trim();


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


                const cleanAddress =
                    String(
                        memberAddress || ""
                    ).trim();


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


                /*
                   Existing members मध्ये check
                */

                let duplicate =
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
                    !duplicate &&
                    cleanMobile !== ""
                ) {

                    duplicate =
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

                }


                /*
                   Same Excel file मधील previous
                   imported rows सुद्धा duplicate
                   म्हणून check होतील.
                */

                if (
                    duplicate
                ) {

                    duplicateCount++;

                    return;

                }


                const newMember = {

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
                        cleanAddress,

                    photo:
                        "",

                    /*
                       Excel मधून आलेली जुनी
                       बाकी कायम Opening Pending म्हणून.
                    */

                    openingSubscriptionPending:
                        cleanPending,

                    subscriptionPending:
                        cleanPending,

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
            "\n" +

            "⚠️ Duplicate: " +
            duplicateCount +
            "\n" +

            "❌ Invalid: " +
            invalidCount
        );

    }
    catch (error) {

        console.error(
            "Excel Import Error:",
            error
        );


        alert(
            "Excel Import करताना समस्या आली.\n\n" +
            "कृपया Excel headings तपासा."
        );

    }
    finally {

        showMemberLoader(
            false
        );


        event.target.value =
            "";

    }

}


/* =========================================================
   21. READ EXCEL
========================================================= */

function readExcelFile(
    file
) {

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


                        const sheet =
                            workbook.Sheets[
                                workbook.SheetNames[0]
                            ];


                        const rows =
                            XLSX.utils.sheet_to_json(
                                sheet,
                                {
                                    defval:
                                        ""
                                }
                            );


                        resolve(
                            rows
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
            j < keys.length;
            j++
        ) {

            const actual =
                normalizeExcelHeader(
                    keys[j]
                );


            if (
                actual ===
                wanted
            ) {

                return row[
                    keys[j]
                ];

            }

        }

    }


    return "";

}


/* =========================================================
   23. NORMALIZE HEADER
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
   24. PARSE PENDING
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


    if (
        typeof value ===
        "number"
    ) {

        return isNaN(value)
            ?
            0
            :
            Number(value);

    }


    let text =
        String(
            value
        )
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
        Number(
            text
        );


    return isNaN(amount)
        ?
        0
        :
        amount;

}


/* =========================================================
   25. NORMALIZE DATE
========================================================= */

function normalizeExcelDate(
    value
) {

    if (!value) {

        return "";

    }


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
   26. EXCEL EXPORT
========================================================= */

if (
    exportBtn
) {

    exportBtn.addEventListener(
        "click",
        exportMembersToExcel
    );

}


function exportMembersToExcel() {

    if (
        members.length === 0
    ) {

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


    worksheet["!cols"] = [

        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 35 },
        { wch: 15 },
        { wch: 18 }

    ];


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

if (
    printBtn
) {

    printBtn.addEventListener(
        "click",
        printMemberList
    );

}


function printMemberList() {

    if (
        members.length === 0
    ) {

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
        ?
        searchMemberInput.value
            .trim()
            .toLowerCase()
        :
        "";


    const selectedWadi =
        wadiFilter
        ?
        wadiFilter.value
        :
        "";


    const printMembers =
        members.filter(
            function(member) {

                const name =
                    String(
                        member.name || ""
                    )
                    .toLowerCase();


                const mobileNumber =
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
                    !searchText ||
                    name.includes(searchText) ||
                    mobileNumber.includes(searchText) ||
                    id.includes(searchText);


                const wadiMatch =
                    !selectedWadi ||
                    member.wadi === selectedWadi;


                return (
                    searchMatch &&
                    wadiMatch
                );

            }
        );


    if (
        printMembers.length === 0
    ) {

        alert(
            "Print करण्यासाठी matching सभासद उपलब्ध नाहीत."
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
                            member.wadi
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            member.mobile
                        )}
                    </td>

                    <td>
                        ₹${pending.toLocaleString(
                            "en-IN"
                        )}
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
                    Arial,
                    sans-serif;
                    padding:20px;
                }

                h1,
                h2 {
                    text-align:center;
                }

                table {
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                th,
                td {
                    border:1px solid #333;
                    padding:8px;
                    text-align:center;
                }

                th {
                    background:#eeeeee;
                }

                @media print {

                    @page {
                        size:landscape;
                        margin:10mm;
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
                    .toLocaleDateString(
                        "mr-IN"
                    )}

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
   28. DASHBOARD COUNT
========================================================= */

function updateDashboardMemberCount() {

    const totalMembers =
        document.getElementById(
            "totalMembers"
        );


    if (
        totalMembers
    ) {

        totalMembers.innerText =
            members.length;

    }

}


/* =========================================================
   29. LOADER
========================================================= */

function showMemberLoader(
    show
) {

    const loader =
        document.getElementById(
            "loader"
        );


    if (!loader) return;


    loader.style.display =
        show
        ?
        "flex"
        :
        "none";

}


/* =========================================================
   30. ESCAPE HTML
========================================================= */

function escapeHTML(
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
   31. ESCAPE JS
========================================================= */

function escapeJS(
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
   32. INITIALIZATION
========================================================= */

function initializeMembersPage() {

    loadMembers();


    /*
       Existing old members migrate.
    */

    members.forEach(
        function(member) {

            ensureMemberPendingStructure(
                member
            );

        }
    );


    saveMembers();


    generateMemberId();

    displayMembers();

    updateDashboardMemberCount();

}


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
