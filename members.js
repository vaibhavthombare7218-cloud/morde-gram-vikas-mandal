/* =========================================================
   members.js
   मोर्डे ग्राम विकास मंडळ, मुंबई
   FINAL MEMBER MANAGEMENT VERSION

   ADDED:
   ✅ Deleted Members List
   ✅ Deleted Member Backup
   ✅ Delete Date & Time
   ✅ Restore Member
   ✅ Deleted member subscription data preserved
   ✅ Deleted Member ID will not be reused

   IMPORTANT:
   बाकी existing functionality मध्ये कोणताही बदल केलेला नाही.
========================================================= */

let members = [];


/* =========================================================
   DATABASE KEYS
========================================================= */

const MGVM_MEMBERS_KEY = "mgvm_members";
const MGVM_DELETED_MEMBERS_KEY = "mgvm_deleted_members";


/* =========================================================
   LOAD ACTIVE MEMBERS
========================================================= */

function loadMembers() {
    try {
        const stored = localStorage.getItem(MGVM_MEMBERS_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        members = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Members Load Error:", error);
        members = [];
    }
}


/* =========================================================
   LOAD DELETED MEMBERS
========================================================= */

function loadDeletedMembers() {
    try {
        const stored = localStorage.getItem(MGVM_DELETED_MEMBERS_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Deleted Members Load Error:", error);
        return [];
    }
}


/* =========================================================
   SAVE DELETED MEMBERS
========================================================= */

function saveDeletedMembers(deletedMembers) {
    try {
        localStorage.setItem(
            MGVM_DELETED_MEMBERS_KEY,
            JSON.stringify(deletedMembers)
        );
        return true;
    } catch (error) {
        console.error("Save Deleted Members Error:", error);
        alert("Deleted सभासद data save करताना समस्या आली.");
        return false;
    }
}


/* =========================================================
   HTML ELEMENTS
========================================================= */

const memberForm = document.getElementById("memberForm");
const memberTableBody = document.getElementById("memberTableBody");
const memberId = document.getElementById("memberId");
const memberName = document.getElementById("memberName");
const mobile = document.getElementById("mobile");
const wadi = document.getElementById("wadi");
const dob = document.getElementById("dob");
const address = document.getElementById("address");
const photo = document.getElementById("photo");
const searchMemberInput = document.getElementById("searchMember");
const wadiFilter = document.getElementById("wadiFilter");
const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");
const printBtn = document.getElementById("printBtn");
const excelFile = document.getElementById("excelFile");


/* =========================================================
   SAVE ACTIVE MEMBERS
========================================================= */

function saveMembers() {
    try {
        localStorage.setItem(
            MGVM_MEMBERS_KEY,
            JSON.stringify(members)
        );
        return true;
    } catch (error) {
        console.error("Save Members Error:", error);
        alert("सभासद data save करताना समस्या आली.");
        return false;
    }
}


/* =========================================================
   SEARCH NORMALIZE
========================================================= */

function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}


/* =========================================================
   GENERATE NEXT MEMBER ID
   Deleted Members चे IDs सुद्धा check केले जातील.
   त्यामुळे Delete झालेला ID पुन्हा वापरला जाणार नाही.
========================================================= */

function generateNextMemberId() {

    let maxNumber = 0;

    members.forEach(member => {

        const match = String(member.id || "")
            .match(/MGVM-(\d+)/i);

        if (match) {
            maxNumber = Math.max(
                maxNumber,
                parseInt(match[1], 10)
            );
        }
    });


    /* Check Deleted Members IDs */

    const deletedMembers = loadDeletedMembers();

    deletedMembers.forEach(member => {

        const match = String(member.id || "")
            .match(/MGVM-(\d+)/i);

        if (match) {
            maxNumber = Math.max(
                maxNumber,
                parseInt(match[1], 10)
            );
        }
    });


    return "MGVM-" +
        String(maxNumber + 1).padStart(4, "0");
}


/* =========================================================
   GENERATE MEMBER ID
========================================================= */

function generateMemberId() {

    if (memberId) {
        memberId.value = generateNextMemberId();
    }
}


/* =========================================================
   IMAGE TO BASE64
========================================================= */

function imageToBase64(file) {

    return new Promise(resolve => {

        if (!file) {
            return resolve("");
        }

        const reader = new FileReader();

        reader.onload = e => resolve(e.target.result);

        reader.onerror = () => resolve("");

        reader.readAsDataURL(file);
    });
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) {
        return alert(message);
    }

    toast.innerText = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}


/* =========================================================
   RESET MEMBER FORM
========================================================= */

function resetMemberForm() {

    if (memberForm) {

        memberForm.reset();

        delete memberForm.dataset.editingId;
    }

    generateMemberId();
}


/* =========================================================
   MEMBER FORM SUBMIT
========================================================= */

if (memberForm) {

    memberForm.addEventListener("submit", async event => {

        event.preventDefault();

        loadMembers();

        const editingId =
            memberForm.dataset.editingId || "";

        const name =
            memberName ? memberName.value.trim() : "";

        const mobileNumber =
            mobile ? mobile.value.trim() : "";

        const wadiName =
            wadi ? wadi.value.trim() : "";

        const birthDate =
            dob ? dob.value : "";

        const memberAddress =
            address ? address.value.trim() : "";


        if (!name) {
            return alert("कृपया सभासदाचे नाव लिहा.");
        }


        const normalizedName =
            normalizeSearchText(name);


        /* =====================================================
           EDIT MEMBER
        ===================================================== */

        if (editingId) {

            const index = members.findIndex(
                item =>
                    String(item.id) === String(editingId)
            );

            if (index === -1) {
                return alert("सभासद सापडला नाही.");
            }


            if (
                members.some(item =>
                    String(item.id) !== String(editingId) &&
                    normalizeSearchText(item.name) === normalizedName
                )
            ) {
                return alert(
                    "हे नाव दुसऱ्या सभासदासाठी वापरले आहे."
                );
            }


            if (
                mobileNumber &&
                members.some(item =>
                    String(item.id) !== String(editingId) &&
                    String(item.mobile || "").trim() === mobileNumber
                )
            ) {
                return alert(
                    "हा मोबाईल नंबर दुसऱ्या सभासदासाठी वापरलेला आहे."
                );
            }


            if (
                photo &&
                photo.files &&
                photo.files[0]
            ) {

                members[index].photo =
                    await imageToBase64(photo.files[0]);
            }


            members[index].name =
                name;

            members[index].mobile =
                mobileNumber;

            members[index].wadi =
                wadiName;

            members[index].dob =
                birthDate;

            members[index].address =
                memberAddress;


            saveMembers();

            displayMembers();

            updateDashboardMemberCount();

            showToast(
                "सभासदाची माहिती Update झाली."
            );

            resetMemberForm();

            return;
        }


        /* =====================================================
           DUPLICATE NAME
        ===================================================== */

        if (
            members.some(
                member =>
                    normalizeSearchText(member.name) ===
                    normalizedName
            )
        ) {

            return alert(
                "हा सभासद आधीपासून नोंदणीकृत आहे."
            );
        }


        /* =====================================================
           DUPLICATE MOBILE
        ===================================================== */

        if (
            mobileNumber &&
            members.some(
                member =>
                    String(member.mobile || "").trim() ===
                    mobileNumber
            )
        ) {

            return alert(
                "हा मोबाईल नंबर आधीच नोंदणीकृत आहे."
            );
        }


        const photoData =
            await imageToBase64(
                photo && photo.files
                    ? photo.files[0]
                    : null
            );


        /* =====================================================
           NEW MEMBER
        ===================================================== */

        members.push({

            id: generateNextMemberId(),

            name,

            mobile: mobileNumber,

            wadi: wadiName,

            dob: birthDate,

            address: memberAddress,

            photo: photoData,

            subscriptionPending: 0,

            subscriptionPayments: [],

            createdDate:
                new Date().toLocaleDateString("mr-IN")
        });


        if (saveMembers()) {

            displayMembers();

            updateDashboardMemberCount();

            showToast(
                "सभासद यशस्वीरित्या जतन झाला."
            );

            resetMemberForm();
        }

    });
}


/* =========================================================
   DISPLAY MEMBERS
========================================================= */

function displayMembers(list = members) {

    if (!memberTableBody) {
        return;
    }


    if (
        !Array.isArray(list) ||
        !list.length
    ) {

        memberTableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;">
                    अद्याप कोणताही सभासद उपलब्ध नाही.
                </td>
            </tr>
        `;

        return;
    }


    memberTableBody.innerHTML = "";


    list.forEach(member => {

        const row =
            document.createElement("tr");

        const pending =
            Number(member.subscriptionPending) || 0;


        let photoHTML =
            `<span>👤</span>`;


        if (member.photo) {

            photoHTML = `
                <img
                    src="${escapeHTML(member.photo)}"
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


        row.innerHTML = `

            <td>${photoHTML}</td>

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
                    class="btn btn-primary">

                    <i class="fa fa-edit"></i>
                    Edit

                </button>


                <button
                    type="button"
                    class="btn btn-danger">

                    <i class="fa fa-trash"></i>
                    Delete

                </button>

            </td>
        `;


        const buttons =
            row.querySelectorAll("button");


        buttons[0]?.addEventListener(
            "click",
            () => editMember(member.id)
        );


        buttons[1]?.addEventListener(
            "click",
            () => deleteMember(member.id)
        );


        row.querySelector("img")
            ?.addEventListener(
                "click",
                () => previewPhoto(member.photo)
            );


        memberTableBody.appendChild(row);

    });
}


/* =========================================================
   SEARCH MEMBERS
========================================================= */

function searchMembers() {

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
        members.filter(member => {

            const searchMatch =
                !keyword ||

                normalizeSearchText(
                    member.name
                ).includes(keyword) ||

                normalizeSearchText(
                    member.mobile
                ).includes(keyword) ||

                normalizeSearchText(
                    member.id
                ).includes(keyword);


            return (
                searchMatch &&
                (
                    !selectedWadi ||
                    String(
                        member.wadi || ""
                    ).trim() === selectedWadi
                )
            );

        });


    displayMembers(filtered);
}


searchMemberInput?.addEventListener(
    "input",
    searchMembers
);

searchMemberInput?.addEventListener(
    "keyup",
    searchMembers
);

wadiFilter?.addEventListener(
    "change",
    searchMembers
);


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function previewPhoto(src) {

    const modal =
        document.getElementById("photoModal");

    const image =
        document.getElementById("previewImage");


    if (!modal || !image) {
        return;
    }


    image.src = src;

    modal.style.display = "block";
}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList?.contains(
                "close"
            )
        ) {

            const modal =
                document.getElementById(
                    "photoModal"
                );

            if (modal) {
                modal.style.display = "none";
            }
        }

    }
);


window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "photoModal"
            );

        if (
            modal &&
            event.target === modal
        ) {

            modal.style.display = "none";
        }

    }
);


/* =========================================================
   EDIT MEMBER
========================================================= */

function editMember(id) {

    loadMembers();

    const member =
        members.find(
            item =>
                String(item.id) === String(id)
        );


    if (!member) {
        return alert(
            "सभासद सापडला नाही."
        );
    }


    if (memberId) {
        memberId.value =
            member.id || "";
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


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   DELETE MEMBER
   IMPORTANT:
   सभासद पूर्णपणे delete न होता
   आधी Deleted Members मध्ये backup होईल.
========================================================= */

function deleteMember(id) {

    loadMembers();


    const member =
        members.find(
            item =>
                String(item.id) === String(id)
        );


    if (!member) {
        return;
    }


    if (
        !confirm(
            "तुम्हाला '" +
            member.name +
            "' हा सभासद Delete करायचा आहे का?"
        )
    ) {
        return;
    }


    /* =====================================================
       LOAD OLD DELETED MEMBERS
    ===================================================== */

    const deletedMembers =
        loadDeletedMembers();


    /* =====================================================
       CREATE DELETED MEMBER COPY
       Original member data untouched.
    ===================================================== */

    const deletedMember = {

        ...member,

        deletedDate:
            new Date().toLocaleDateString(
                "mr-IN"
            ),

        deletedTime:
            new Date().toLocaleTimeString(
                "mr-IN"
            ),

        deletedDateTime:
            new Date().toISOString(),

        deletedStatus: true

    };


    /* =====================================================
       DUPLICATE CHECK IN DELETED LIST
    ===================================================== */

    const alreadyDeleted =
        deletedMembers.some(
            item =>
                String(item.id) ===
                String(member.id)
        );


    if (!alreadyDeleted) {

        deletedMembers.push(
            deletedMember
        );

        saveDeletedMembers(
            deletedMembers
        );
    }


    /* =====================================================
       REMOVE FROM ACTIVE MEMBERS
    ===================================================== */

    members =
        members.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveMembers();


    /* =====================================================
       REFRESH
    ===================================================== */

    displayMembers();

    generateMemberId();

    updateDashboardMemberCount();


    showToast(
        "सभासद Deleted Members मध्ये सुरक्षित केला आहे."
    );


    /* =====================================================
       UPDATE DELETED COUNT
    ===================================================== */

    updateDeletedMemberCount();
}


/* =========================================================
   CREATE DELETED MEMBERS BUTTON
   HTML मध्ये button add करण्याची गरज नाही.
   JS स्वतः button तयार करेल.
========================================================= */

function createDeletedMembersButton() {

    if (
        document.getElementById(
            "deletedMembersBtn"
        )
    ) {
        return;
    }


    const button =
        document.createElement("button");


    button.id =
        "deletedMembersBtn";


    button.type =
        "button";


    button.className =
        "btn btn-warning";


    button.style.margin =
        "5px";


    button.innerHTML = `
        <i class="fa fa-trash-restore"></i>
        Deleted सभासद
        <span
            id="deletedMembersCount"
            style="
                display:inline-block;
                min-width:20px;
                padding:2px 6px;
                margin-left:5px;
                border-radius:10px;
                background:#ffffff;
                color:#5b0b18;
                font-weight:bold;
            "
        >0</span>
    `;


    button.addEventListener(
        "click",
        showDeletedMembers
    );


    /* =====================================================
       Try common button/container locations
    ===================================================== */

    const container =
        document.querySelector(
            ".member-actions"
        ) ||
        document.querySelector(
            ".action-buttons"
        ) ||
        document.querySelector(
            ".buttons"
        ) ||
        document.querySelector(
            ".container"
        );


    if (container) {

        container.appendChild(button);

    } else {

        document.body.insertBefore(
            button,
            document.body.firstChild
        );
    }


    updateDeletedMemberCount();
}


/* =========================================================
   UPDATE DELETED MEMBER COUNT
========================================================= */

function updateDeletedMemberCount() {

    const countElement =
        document.getElementById(
            "deletedMembersCount"
        );


    if (!countElement) {
        return;
    }


    const deletedMembers =
        loadDeletedMembers();


    countElement.innerText =
        deletedMembers.length;
}


/* =========================================================
   CREATE DELETED MEMBERS MODAL
========================================================= */

function createDeletedMembersModal() {

    if (
        document.getElementById(
            "deletedMembersModal"
        )
    ) {
        return;
    }


    const modal =
        document.createElement("div");


    modal.id =
        "deletedMembersModal";


    modal.style.cssText = `
        display:none;
        position:fixed;
        z-index:99999;
        left:0;
        top:0;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.65);
        overflow:auto;
        padding:20px;
    `;


    modal.innerHTML = `

        <div
            style="
                background:#fff;
                max-width:1100px;
                margin:30px auto;
                border-radius:12px;
                padding:20px;
                position:relative;
            "
        >

            <button
                type="button"
                id="closeDeletedMembersModal"
                style="
                    position:absolute;
                    right:15px;
                    top:10px;
                    border:none;
                    background:#5b0b18;
                    color:white;
                    width:35px;
                    height:35px;
                    border-radius:50%;
                    font-size:20px;
                    cursor:pointer;
                "
            >
                ×
            </button>


            <h2
                style="
                    text-align:center;
                    color:#5b0b18;
                    margin-bottom:15px;
                "
            >
                🗑️ Deleted सभासद यादी
            </h2>


            <div
                style="
                    overflow-x:auto;
                "
            >

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        min-width:800px;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#5b0b18;
                                color:white;
                            "
                        >

                            <th style="padding:10px;">
                                क्र.
                            </th>

                            <th style="padding:10px;">
                                Member ID
                            </th>

                            <th style="padding:10px;">
                                सभासद नाव
                            </th>

                            <th style="padding:10px;">
                                वाडी
                            </th>

                            <th style="padding:10px;">
                                मोबाईल
                            </th>

                            <th style="padding:10px;">
                                बाकी वर्गणी
                            </th>

                            <th style="padding:10px;">
                                Delete Date
                            </th>

                            <th style="padding:10px;">
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody
                        id="deletedMembersTableBody"
                    ></tbody>

                </table>

            </div>


            <div
                id="deletedMembersEmpty"
                style="
                    display:none;
                    text-align:center;
                    padding:25px;
                    color:#666;
                "
            >
                कोणताही Deleted सभासद उपलब्ध नाही.
            </div>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById(
            "closeDeletedMembersModal"
        )
        ?.addEventListener(
            "click",
            () => {
                modal.style.display = "none";
            }
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {
                modal.style.display =
                    "none";
            }

        }
    );
}


/* =========================================================
   SHOW DELETED MEMBERS
========================================================= */

function showDeletedMembers() {

    createDeletedMembersModal();


    const modal =
        document.getElementById(
            "deletedMembersModal"
        );


    const tableBody =
        document.getElementById(
            "deletedMembersTableBody"
        );


    const emptyMessage =
        document.getElementById(
            "deletedMembersEmpty"
        );


    if (
        !modal ||
        !tableBody
    ) {
        return;
    }


    const deletedMembers =
        loadDeletedMembers();


    tableBody.innerHTML = "";


    if (!deletedMembers.length) {

        tableBody.style.display =
            "none";

        if (emptyMessage) {
            emptyMessage.style.display =
                "block";
        }

        modal.style.display =
            "block";

        return;
    }


    tableBody.style.display =
        "table-row-group";


    if (emptyMessage) {
        emptyMessage.style.display =
            "none";
    }


    deletedMembers
        .slice()
        .reverse()
        .forEach(
            (member, index) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const pending =
                    Number(
                        member.subscriptionPending
                    ) || 0;


                row.innerHTML = `

                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                            text-align:center;
                        "
                    >
                        ${index + 1}
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                            text-align:center;
                        "
                    >
                        ${escapeHTML(member.id)}
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                        "
                    >
                        ${escapeHTML(member.name)}
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                        "
                    >
                        ${escapeHTML(member.wadi)}
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                        "
                    >
                        ${escapeHTML(member.mobile)}
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                            text-align:center;
                        "
                    >
                        ₹${pending.toLocaleString("en-IN")}
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                            text-align:center;
                        "
                    >
                        ${escapeHTML(
                            member.deletedDate || ""
                        )}

                        <br>

                        <small>
                            ${escapeHTML(
                                member.deletedTime || ""
                            )}
                        </small>
                    </td>


                    <td
                        style="
                            padding:8px;
                            border:1px solid #ddd;
                            text-align:center;
                        "
                    >

                        <button
                            type="button"
                            class="restoreDeletedMemberBtn"
                            data-id="${escapeHTML(member.id)}"
                            style="
                                background:#198754;
                                color:#fff;
                                border:none;
                                padding:7px 12px;
                                border-radius:5px;
                                cursor:pointer;
                            "
                        >

                            <i class="fa fa-undo"></i>
                            Restore

                        </button>

                    </td>
                `;


                row
                    .querySelector(
                        ".restoreDeletedMemberBtn"
                    )
                    ?.addEventListener(
                        "click",
                        () =>
                            restoreDeletedMember(
                                member.id
                            )
                    );


                tableBody.appendChild(row);

            }
        );


    modal.style.display =
        "block";
}


/* =========================================================
   RESTORE DELETED MEMBER
========================================================= */

function restoreDeletedMember(id) {

    loadMembers();


    const deletedMembers =
        loadDeletedMembers();


    const index =
        deletedMembers.findIndex(
            item =>
                String(item.id) ===
                String(id)
        );


    if (index === -1) {

        return alert(
            "Deleted सभासद सापडला नाही."
        );
    }


    const member =
        deletedMembers[index];


    /* =====================================================
       DUPLICATE MEMBER ID CHECK
    ===================================================== */

    if (
        members.some(
            item =>
                String(item.id) ===
                String(member.id)
        )
    ) {

        return alert(
            "हा Member ID सध्या दुसऱ्या सभासदाला दिलेला आहे."
        );
    }


    /* =====================================================
       DUPLICATE NAME CHECK
    ===================================================== */

    if (
        members.some(
            item =>
                normalizeSearchText(
                    item.name
                ) ===
                normalizeSearchText(
                    member.name
                )
        )
    ) {

        return alert(
            "याच नावाचा सभासद सध्या Active Members मध्ये आहे."
        );
    }


    /* =====================================================
       DUPLICATE MOBILE CHECK
    ===================================================== */

    if (
        member.mobile &&
        members.some(
            item =>
                String(
                    item.mobile || ""
                ).trim() ===
                String(
                    member.mobile || ""
                ).trim()
        )
    ) {

        return alert(
            "याच मोबाईल नंबरचा सभासद सध्या Active Members मध्ये आहे."
        );
    }


    if (
        !confirm(
            "'" +
            member.name +
            "' हा सभासद पुन्हा Active Members मध्ये Restore करायचा आहे का?"
        )
    ) {
        return;
    }


    /* =====================================================
       REMOVE DELETED STATUS
    ===================================================== */

    const restoredMember = {
        ...member
    };


    delete restoredMember.deletedDate;

    delete restoredMember.deletedTime;

    delete restoredMember.deletedDateTime;

    delete restoredMember.deletedStatus;


    /* =====================================================
       ADD BACK TO ACTIVE MEMBERS
    ===================================================== */

    members.push(
        restoredMember
    );


    /* =====================================================
       REMOVE FROM DELETED MEMBERS
    ===================================================== */

    deletedMembers.splice(
        index,
        1
    );


    /* =====================================================
       SAVE BOTH
    ===================================================== */

    const activeSaved =
        saveMembers();


    const deletedSaved =
        saveDeletedMembers(
            deletedMembers
        );


    if (
        activeSaved &&
        deletedSaved
    ) {

        displayMembers();

        generateMemberId();

        updateDashboardMemberCount();

        updateDeletedMemberCount();

        showDeletedMembers();

        showToast(
            "सभासद यशस्वीरित्या Restore झाला."
        );
    }
}


/* =========================================================
   EXCEL IMPORT
========================================================= */

if (importBtn && excelFile) {

    importBtn.addEventListener(
        "click",
        () => excelFile.click()
    );


    excelFile.addEventListener(
        "change",
        handleExcelImport
    );
}


async function handleExcelImport(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    try {

        showMemberLoader(true);


        if (
            typeof XLSX ===
            "undefined"
        ) {

            return alert(
                "Excel Library उपलब्ध नाही."
            );
        }


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            ![
                "xlsx",
                "xls",
                "csv"
            ].includes(extension)
        ) {

            return alert(
                "कृपया .xlsx, .xls किंवा .csv file निवडा."
            );
        }


        const data =
            await readExcelFile(file);


        if (!data.length) {

            return alert(
                "Excel file मध्ये data उपलब्ध नाही."
            );
        }


        let importedCount = 0;

        let duplicateCount = 0;

        let invalidCount = 0;


        data.forEach(row => {

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
                !String(name || "")
                    .trim()
            ) {

                invalidCount++;

                return;
            }


            const cleanName =
                String(name).trim();


            const cleanMobile =
                String(
                    getExcelValue(
                        row,
                        [
                            "मोबाईल",
                            "मोबाईल नंबर",
                            "Mobile",
                            "Mobile Number",
                            "mobile"
                        ]
                    ) || ""
                ).trim();


            const cleanWadi =
                String(
                    getExcelValue(
                        row,
                        [
                            "वाडी",
                            "Wadi",
                            "wadi"
                        ]
                    ) || ""
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


            const cleanPending =
                parsePendingAmount(
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
                    )
                );


            if (
                members.some(
                    member =>
                        normalizeSearchText(
                            member.name
                        ) ===
                        normalizeSearchText(
                            cleanName
                        ) ||

                        (
                            cleanMobile &&
                            String(
                                member.mobile || ""
                            ).trim() ===
                            cleanMobile
                        )
                )
            ) {

                duplicateCount++;

                return;
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

                photo: "",

                subscriptionPending:
                    cleanPending,

                subscriptionPayments: [],

                createdDate:
                    new Date()
                        .toLocaleDateString(
                            "mr-IN"
                        )
            });


            importedCount++;

        });


        saveMembers();

        displayMembers();

        generateMemberId();

        updateDashboardMemberCount();


        alert(
            `Excel Import पूर्ण झाला.\n\n` +
            `✅ नवीन सभासद: ${importedCount}\n` +
            `⚠️ Duplicate: ${duplicateCount}\n` +
            `❌ Invalid: ${invalidCount}`
        );


    } catch (error) {

        console.error(
            "Excel Import Error:",
            error
        );


        alert(
            "Excel Import करताना समस्या आली."
        );


    } finally {

        showMemberLoader(false);

        event.target.value = "";
    }
}


/* =========================================================
   READ EXCEL FILE
========================================================= */

function readExcelFile(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

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


                        resolve(
                            XLSX.utils.sheet_to_json(
                                sheet,
                                {
                                    defval: ""
                                }
                            )
                        );


                    } catch (error) {

                        reject(error);
                    }
                };


            reader.onerror =
                reject;


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

    const keys =
        Object.keys(row || {});


    for (
        const possible
        of possibleNames
    ) {

        const wanted =
            normalizeExcelHeader(
                possible
            );


        const key =
            keys.find(
                k =>
                    normalizeExcelHeader(k) ===
                    wanted
            );


        if (
            key !== undefined
        ) {

            return row[key];
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

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/_/g, "");
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


    if (
        typeof value === "number"
    ) {

        return isNaN(value)
            ? 0
            : Number(value);
    }


    const amount =
        Number(
            String(value)
                .replace(/₹/g, "")
                .replace(/,/g, "")
                .replace(/\s/g, "")
                .trim()
        );


    return isNaN(amount)
        ? 0
        : amount;
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


    if (
        value instanceof Date &&
        !isNaN(value.getTime())
    ) {

        return `${value.getFullYear()}-${String(
            value.getMonth() + 1
        ).padStart(2, "0")}-${String(
            value.getDate()
        ).padStart(2, "0")}`;
    }


    const text =
        String(value).trim();


    if (
        /^\d{4}-\d{1,2}-\d{1,2}$/
            .test(text)
    ) {

        const p =
            text.split("-");


        return `${p[0]}-${String(
            p[1]
        ).padStart(2, "0")}-${String(
            p[2]
        ).padStart(2, "0")}`;
    }


    if (
        /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/
            .test(text)
    ) {

        const p =
            text.split(/[/-]/);


        return `${p[2]}-${String(
            p[1]
        ).padStart(2, "0")}-${String(
            p[0]
        ).padStart(2, "0")}`;
    }


    return text;
}


/* =========================================================
   EXPORT
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

        return alert(
            "Export करण्यासाठी कोणताही सभासद उपलब्ध नाही."
        );
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        return alert(
            "Excel Library उपलब्ध नाही."
        );
    }


    const exportData =
        members.map(
            member => ({

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

            })
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
   PRINT
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

        return alert(
            "Print करण्यासाठी सभासद उपलब्ध नाहीत."
        );
    }


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        return alert(
            "Popup Blocker मुळे Print Window उघडता आली नाही."
        );
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
            member => {

                const match =
                    !searchText ||

                    normalizeSearchText(
                        member.name
                    ).includes(searchText) ||

                    normalizeSearchText(
                        member.mobile
                    ).includes(searchText) ||

                    normalizeSearchText(
                        member.id
                    ).includes(searchText);


                return (
                    match &&
                    (
                        !selectedWadi ||
                        String(
                            member.wadi || ""
                        ).trim() ===
                        selectedWadi
                    )
                );

            }
        );


    if (!printMembers.length) {

        printWindow.close();

        return alert(
            "Matching सभासद उपलब्ध नाहीत."
        );
    }


    let rows = "";


    printMembers.forEach(
        (member, index) => {

            rows += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHTML(member.id)}</td>
                    <td>${escapeHTML(member.name)}</td>
                    <td>${escapeHTML(member.wadi)}</td>
                    <td>${escapeHTML(member.mobile)}</td>
                    <td>₹${(
                        Number(
                            member.subscriptionPending
                        ) || 0
                    ).toLocaleString("en-IN")}</td>
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

                body{
                    font-family:Arial,sans-serif;
                    padding:20px
                }

                h1,
                h2{
                    text-align:center
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px
                }

                th,
                td{
                    border:1px solid #333;
                    padding:8px;
                    text-align:center
                }

                th{
                    background:#eee
                }

                @media print{

                    @page{
                        size:landscape;
                        margin:10mm
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

                |

                तारीख:
                ${new Date().toLocaleDateString("mr-IN")}

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
        () => {

            printWindow.focus();

            printWindow.print();

        },
        500
    );
}


/* =========================================================
   DASHBOARD MEMBER COUNT
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
   LOADER
========================================================= */

function showMemberLoader(
    show
) {

    const loader =
        document.getElementById(
            "loader"
        );


    if (loader) {

        loader.style.display =
            show
                ? "flex"
                : "none";
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value || "")
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
   INITIALIZE MEMBERS PAGE
========================================================= */

function initializeMembersPage() {

    loadMembers();

    generateMemberId();

    displayMembers();

    updateDashboardMemberCount();


    /* =====================================================
       NEW:
       Deleted Members Button + Modal
    ===================================================== */

    createDeletedMembersButton();

    createDeletedMembersModal();

    updateDeletedMemberCount();
}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMembersPage
    );

} else {

    initializeMembersPage();
}


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "MGVM members.js loaded successfully."
);

console.log(
    "MGVM Deleted Members system loaded successfully."
);
