/* =========================================================
   members.js
   मोर्डे ग्राम विकास मंडळ, मुंबई
   FINAL MEMBER MANAGEMENT VERSION
========================================================= */

let members = [];

function loadMembers() {
    try {
        const stored = localStorage.getItem("mgvm_members");
        const parsed = stored ? JSON.parse(stored) : [];
        members = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Members Load Error:", error);
        members = [];
    }
}

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

function saveMembers() {
    try {
        localStorage.setItem("mgvm_members", JSON.stringify(members));
        return true;
    } catch (error) {
        console.error("Save Members Error:", error);
        alert("सभासद data save करताना समस्या आली.");
        return false;
    }
}

function normalizeSearchText(value) {
    return String(value || "").normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

function generateNextMemberId() {
    let maxNumber = 0;
    members.forEach(member => {
        const match = String(member.id || "").match(/MGVM-(\d+)/i);
        if (match) maxNumber = Math.max(maxNumber, parseInt(match[1], 10));
    });
    return "MGVM-" + String(maxNumber + 1).padStart(4, "0");
}

function generateMemberId() {
    if (memberId) memberId.value = generateNextMemberId();
}

function imageToBase64(file) {
    return new Promise(resolve => {
        if (!file) return resolve("");
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return alert(message);
    toast.innerText = message;
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 2500);
}

function resetMemberForm() {
    if (memberForm) {
        memberForm.reset();
        delete memberForm.dataset.editingId;
    }
    generateMemberId();
}

if (memberForm) {
    memberForm.addEventListener("submit", async event => {
        event.preventDefault();
        loadMembers();

        const editingId = memberForm.dataset.editingId || "";
        const name = memberName ? memberName.value.trim() : "";
        const mobileNumber = mobile ? mobile.value.trim() : "";
        const wadiName = wadi ? wadi.value.trim() : "";
        const birthDate = dob ? dob.value : "";
        const memberAddress = address ? address.value.trim() : "";

        if (!name) return alert("कृपया सभासदाचे नाव लिहा.");

        const normalizedName = normalizeSearchText(name);

        if (editingId) {
            const index = members.findIndex(item => String(item.id) === String(editingId));
            if (index === -1) return alert("सभासद सापडला नाही.");

            if (members.some(item =>
                String(item.id) !== String(editingId) &&
                normalizeSearchText(item.name) === normalizedName
            )) return alert("हे नाव दुसऱ्या सभासदासाठी वापरले आहे.");

            if (mobileNumber && members.some(item =>
                String(item.id) !== String(editingId) &&
                String(item.mobile || "").trim() === mobileNumber
            )) return alert("हा मोबाईल नंबर दुसऱ्या सभासदासाठी वापरलेला आहे.");

            if (photo && photo.files && photo.files[0]) {
                members[index].photo = await imageToBase64(photo.files[0]);
            }

            members[index].name = name;
            members[index].mobile = mobileNumber;
            members[index].wadi = wadiName;
            members[index].dob = birthDate;
            members[index].address = memberAddress;

            saveMembers();
            displayMembers();
            updateDashboardMemberCount();
            showToast("सभासदाची माहिती Update झाली.");
            resetMemberForm();
            return;
        }

        if (members.some(member => normalizeSearchText(member.name) === normalizedName)) {
            return alert("हा सभासद आधीपासून नोंदणीकृत आहे.");
        }

        if (mobileNumber && members.some(member =>
            String(member.mobile || "").trim() === mobileNumber
        )) return alert("हा मोबाईल नंबर आधीच नोंदणीकृत आहे.");

        const photoData = await imageToBase64(photo && photo.files ? photo.files[0] : null);

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
            createdDate: new Date().toLocaleDateString("mr-IN")
        });

        if (saveMembers()) {
            displayMembers();
            updateDashboardMemberCount();
            showToast("सभासद यशस्वीरित्या जतन झाला.");
            resetMemberForm();
        }
    });
}

function displayMembers(list = members) {
    if (!memberTableBody) return;

    if (!Array.isArray(list) || !list.length) {
        memberTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">अद्याप कोणताही सभासद उपलब्ध नाही.</td></tr>`;
        return;
    }

    memberTableBody.innerHTML = "";

    list.forEach(member => {
        const row = document.createElement("tr");
        const pending = Number(member.subscriptionPending) || 0;

        let photoHTML = `<span>👤</span>`;
        if (member.photo) {
            photoHTML = `<img src="${escapeHTML(member.photo)}" alt="Photo" style="width:45px;height:45px;object-fit:cover;border-radius:50%;cursor:pointer;">`;
        }

        row.innerHTML = `
            <td>${photoHTML}</td>
            <td>${escapeHTML(member.id)}</td>
            <td>${escapeHTML(member.name)}</td>
            <td>${escapeHTML(member.wadi)}</td>
            <td>${escapeHTML(member.mobile)}</td>
            <td>₹${pending.toLocaleString("en-IN")}</td>
            <td>
                <button type="button" class="btn btn-primary"><i class="fa fa-edit"></i> Edit</button>
                <button type="button" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
            </td>`;

        const buttons = row.querySelectorAll("button");
        buttons[0]?.addEventListener("click", () => editMember(member.id));
        buttons[1]?.addEventListener("click", () => deleteMember(member.id));
        row.querySelector("img")?.addEventListener("click", () => previewPhoto(member.photo));
        memberTableBody.appendChild(row);
    });
}

function searchMembers() {
    loadMembers();
    const keyword = searchMemberInput ? normalizeSearchText(searchMemberInput.value) : "";
    const selectedWadi = wadiFilter ? String(wadiFilter.value || "").trim() : "";

    const filtered = members.filter(member => {
        const searchMatch = !keyword ||
            normalizeSearchText(member.name).includes(keyword) ||
            normalizeSearchText(member.mobile).includes(keyword) ||
            normalizeSearchText(member.id).includes(keyword);

        return searchMatch && (!selectedWadi || String(member.wadi || "").trim() === selectedWadi);
    });

    displayMembers(filtered);
}

searchMemberInput?.addEventListener("input", searchMembers);
searchMemberInput?.addEventListener("keyup", searchMembers);
wadiFilter?.addEventListener("change", searchMembers);

function previewPhoto(src) {
    const modal = document.getElementById("photoModal");
    const image = document.getElementById("previewImage");
    if (!modal || !image) return;
    image.src = src;
    modal.style.display = "block";
}

document.addEventListener("click", event => {
    if (event.target.classList?.contains("close")) {
        const modal = document.getElementById("photoModal");
        if (modal) modal.style.display = "none";
    }
});

window.addEventListener("click", event => {
    const modal = document.getElementById("photoModal");
    if (modal && event.target === modal) modal.style.display = "none";
});

function editMember(id) {
    loadMembers();
    const member = members.find(item => String(item.id) === String(id));
    if (!member) return alert("सभासद सापडला नाही.");

    if (memberId) memberId.value = member.id || "";
    if (memberName) memberName.value = member.name || "";
    if (mobile) mobile.value = member.mobile || "";
    if (wadi) wadi.value = member.wadi || "";
    if (dob) dob.value = member.dob || "";
    if (address) address.value = member.address || "";

    if (memberForm) memberForm.dataset.editingId = member.id;

    showToast("सभासदाची माहिती Edit करण्यासाठी Form मध्ये भरली आहे.");
    window.scrollTo({top: 0, behavior: "smooth"});
}

function deleteMember(id) {
    loadMembers();
    const member = members.find(item => String(item.id) === String(id));
    if (!member) return;

    if (!confirm("तुम्हाला '" + member.name + "' हा सभासद Delete करायचा आहे का?")) return;

    members = members.filter(item => String(item.id) !== String(id));
    saveMembers();
    displayMembers();
    generateMemberId();
    updateDashboardMemberCount();
    showToast("सभासद Delete झाला.");
}

if (importBtn && excelFile) {
    importBtn.addEventListener("click", () => excelFile.click());
    excelFile.addEventListener("change", handleExcelImport);
}

async function handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        showMemberLoader(true);

        if (typeof XLSX === "undefined") return alert("Excel Library उपलब्ध नाही.");

        const extension = file.name.split(".").pop().toLowerCase();
        if (!["xlsx", "xls", "csv"].includes(extension)) {
            return alert("कृपया .xlsx, .xls किंवा .csv file निवडा.");
        }

        const data = await readExcelFile(file);
        if (!data.length) return alert("Excel file मध्ये data उपलब्ध नाही.");

        let importedCount = 0, duplicateCount = 0, invalidCount = 0;

        data.forEach(row => {
            const name = getExcelValue(row, ["नाव","सभासद नाव","Name","Member Name","memberName"]);
            if (!String(name || "").trim()) {
                invalidCount++;
                return;
            }

            const cleanName = String(name).trim();
            const cleanMobile = String(getExcelValue(row, ["मोबाईल","मोबाईल नंबर","Mobile","Mobile Number","mobile"]) || "").trim();
            const cleanWadi = String(getExcelValue(row, ["वाडी","Wadi","wadi"]) || "").trim();
            const birthDate = getExcelValue(row, ["जन्मतारीख","DOB","Date of Birth","Birth Date","dob"]);
            const memberAddress = getExcelValue(row, ["पत्ता","Address","address"]);
            const cleanPending = parsePendingAmount(getExcelValue(row, ["बाकी वर्गणी","बाकी","वर्गणी बाकी","Pending","Pending Amount","Subscription Pending","subscriptionPending"]));

            if (members.some(member =>
                normalizeSearchText(member.name) === normalizeSearchText(cleanName) ||
                (cleanMobile && String(member.mobile || "").trim() === cleanMobile)
            )) {
                duplicateCount++;
                return;
            }

            members.push({
                id: generateNextMemberId(),
                name: cleanName,
                mobile: cleanMobile,
                wadi: cleanWadi,
                dob: normalizeExcelDate(birthDate),
                address: String(memberAddress || "").trim(),
                photo: "",
                subscriptionPending: cleanPending,
                subscriptionPayments: [],
                createdDate: new Date().toLocaleDateString("mr-IN")
            });

            importedCount++;
        });

        saveMembers();
        displayMembers();
        generateMemberId();
        updateDashboardMemberCount();

        alert(`Excel Import पूर्ण झाला.\n\n✅ नवीन सभासद: ${importedCount}\n⚠️ Duplicate: ${duplicateCount}\n❌ Invalid: ${invalidCount}`);
    } catch (error) {
        console.error("Excel Import Error:", error);
        alert("Excel Import करताना समस्या आली.");
    } finally {
        showMemberLoader(false);
        event.target.value = "";
    }
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const workbook = XLSX.read(event.target.result, {type:"array", cellDates:true});
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                resolve(XLSX.utils.sheet_to_json(sheet, {defval:""}));
            } catch (error) { reject(error); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function getExcelValue(row, possibleNames) {
    const keys = Object.keys(row || {});
    for (const possible of possibleNames) {
        const wanted = normalizeExcelHeader(possible);
        const key = keys.find(k => normalizeExcelHeader(k) === wanted);
        if (key !== undefined) return row[key];
    }
    return "";
}

function normalizeExcelHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g,"").replace(/_/g,"");
}

function parsePendingAmount(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return isNaN(value) ? 0 : Number(value);
    const amount = Number(String(value).replace(/₹/g,"").replace(/,/g,"").replace(/\s/g,"").trim());
    return isNaN(amount) ? 0 : amount;
}

function normalizeExcelDate(value) {
    if (!value) return "";
    if (value instanceof Date && !isNaN(value.getTime())) {
        return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;
    }

    const text = String(value).trim();
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
        const p = text.split("-");
        return `${p[0]}-${String(p[1]).padStart(2,"0")}-${String(p[2]).padStart(2,"0")}`;
    }
    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(text)) {
        const p = text.split(/[/-]/);
        return `${p[2]}-${String(p[1]).padStart(2,"0")}-${String(p[0]).padStart(2,"0")}`;
    }
    return text;
}

if (exportBtn) exportBtn.addEventListener("click", exportMembersToExcel);

function exportMembersToExcel() {
    loadMembers();
    if (!members.length) return alert("Export करण्यासाठी कोणताही सभासद उपलब्ध नाही.");
    if (typeof XLSX === "undefined") return alert("Excel Library उपलब्ध नाही.");

    const exportData = members.map(member => ({
        "Member ID": member.id || "",
        "सभासद नाव": member.name || "",
        "मोबाईल": member.mobile || "",
        "वाडी": member.wadi || "",
        "जन्मतारीख": member.dob || "",
        "पत्ता": member.address || "",
        "बाकी वर्गणी": Number(member.subscriptionPending) || 0,
        "नोंदणी तारीख": member.createdDate || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "सभासद");
    XLSX.writeFile(workbook, "MGVM_Members.xlsx");
    showToast("सभासदांची Excel फाईल तयार झाली.");
}

if (printBtn) printBtn.addEventListener("click", printMemberList);

function printMemberList() {
    loadMembers();
    if (!members.length) return alert("Print करण्यासाठी सभासद उपलब्ध नाहीत.");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Popup Blocker मुळे Print Window उघडता आली नाही.");

    const searchText = searchMemberInput ? normalizeSearchText(searchMemberInput.value) : "";
    const selectedWadi = wadiFilter ? String(wadiFilter.value || "").trim() : "";

    const printMembers = members.filter(member => {
        const match = !searchText ||
            normalizeSearchText(member.name).includes(searchText) ||
            normalizeSearchText(member.mobile).includes(searchText) ||
            normalizeSearchText(member.id).includes(searchText);

        return match && (!selectedWadi || String(member.wadi || "").trim() === selectedWadi);
    });

    if (!printMembers.length) {
        printWindow.close();
        return alert("Matching सभासद उपलब्ध नाहीत.");
    }

    let rows = "";
    printMembers.forEach((member,index) => {
        rows += `<tr><td>${index+1}</td><td>${escapeHTML(member.id)}</td><td>${escapeHTML(member.name)}</td><td>${escapeHTML(member.wadi)}</td><td>${escapeHTML(member.mobile)}</td><td>₹${(Number(member.subscriptionPending)||0).toLocaleString("en-IN")}</td></tr>`;
    });

    printWindow.document.write(`
        <!DOCTYPE html><html lang="mr"><head><meta charset="UTF-8"><title>MGVM सभासद यादी</title>
        <style>
        body{font-family:Arial,sans-serif;padding:20px}h1,h2{text-align:center}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{border:1px solid #333;padding:8px;text-align:center}
        th{background:#eee}@media print{@page{size:landscape;margin:10mm}}
        </style></head><body>
        <h1>मोर्डे ग्राम विकास मंडळ, मुंबई</h1><h2>सभासद यादी</h2>
        <p style="text-align:center;">एकूण सभासद: ${printMembers.length} | तारीख: ${new Date().toLocaleDateString("mr-IN")}</p>
        <table><thead><tr><th>क्र.</th><th>Member ID</th><th>नाव</th><th>वाडी</th><th>मोबाईल</th><th>बाकी वर्गणी</th></tr></thead>
        <tbody>${rows}</tbody></table></body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
}

function updateDashboardMemberCount() {
    loadMembers();
    const totalMembers = document.getElementById("totalMembers");
    if (totalMembers) totalMembers.innerText = members.length;
}

function showMemberLoader(show) {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = show ? "flex" : "none";
}

function escapeHTML(value) {
    return String(value || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function initializeMembersPage() {
    loadMembers();
    generateMemberId();
    displayMembers();
    updateDashboardMemberCount();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMembersPage);
} else {
    initializeMembersPage();
}

console.log("MGVM members.js loaded successfully.");
