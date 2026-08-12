/* =========================================================
   member-details.js
   मोर्डे ग्राम विकास मंडळ, मुंबई
   FINAL MEMBER DETAILS VERSION
========================================================= */

const MEMBER_DETAILS_MEMBERS_KEY = "mgvm_members";
const MEMBER_DETAILS_SUBSCRIPTION_KEY = "mgvm_subscriptions";
const MEMBER_DETAILS_DONATION_KEY = "mgvm_donations";
const FROM_2026_DATE = "2026-01-01";

let detailMembers = [];
let detailSubscriptions = [];
let detailDonations = [];

function getLocalArray(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Storage Error:", key, error);
        return [];
    }
}

function loadMemberDetailsData() {
    detailMembers = getLocalArray(MEMBER_DETAILS_MEMBERS_KEY);
    detailSubscriptions = getLocalArray(MEMBER_DETAILS_SUBSCRIPTION_KEY);
    detailDonations = getLocalArray(MEMBER_DETAILS_DONATION_KEY);
}

function normalizeDetailText(value) {
    return String(value || "").normalize("NFC").trim().replace(/\s+/g," ").toLowerCase();
}

function escapeDetailHTML(value) {
    return String(value ?? "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function formatDetailMoney(amount) {
    return "₹" + (Number(amount || 0)).toLocaleString("en-IN");
}

function getMemberId(member) {
    return String(member?.id || member?.memberId || "").trim();
}

function getDonationMemberId(donation) {
    return String(donation?.memberId || donation?.idMember || donation?.memberID || "").trim();
}

function getSubscriptionMemberId(subscription) {
    return String(subscription?.memberId || subscription?.memberID || subscription?.idMember || "").trim();
}

function isFrom2026(dateValue) {
    if (!dateValue) return false;
    const text = String(dateValue).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text >= FROM_2026_DATE;
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.substring(0,10) >= FROM_2026_DATE;

    const date = new Date(text);
    return !isNaN(date.getTime()) && date.getFullYear() >= 2026;
}

function getMemberSubscriptionFrom2026(member) {
    const memberId = getMemberId(member);
    if (!memberId) return 0;

    return detailSubscriptions
        .filter(item =>
            getSubscriptionMemberId(item) === memberId &&
            isFrom2026(item.paymentDate || item.date || item.paymentDateTime)
        )
        .reduce((total,item) => total + (Number(item.paidAmount ?? item.amount) || 0),0);
}

function getMemberDonationFrom2026(member) {
    const memberId = getMemberId(member);
    if (!memberId) return 0;

    return detailDonations
        .filter(donation =>
            getDonationMemberId(donation) === memberId &&
            isFrom2026(donation.donationDate || donation.date || donation.paymentDate)
        )
        .reduce((total,donation) => total + (Number(donation.amount) || 0),0);
}

function getEmbeddedMemberDonationFrom2026(member) {
    if (!Array.isArray(member?.donations)) return 0;

    return member.donations
        .filter(donation => isFrom2026(donation.donationDate || donation.date || donation.paymentDate))
        .reduce((total,donation) => total + (Number(donation.amount) || 0),0);
}

function getFinalMemberDonationFrom2026(member) {
    const direct = getMemberDonationFrom2026(member);
    return direct > 0 ? direct : getEmbeddedMemberDonationFrom2026(member);
}

function getMemberPending(member) {
    return Math.max(0,Number(member?.subscriptionPending)||0);
}

function findDetailMember(id) {
    return detailMembers.find(member => getMemberId(member) === String(id)) || null;
}

function displayMemberDetailsList(list) {
    const tbody = document.getElementById("memberTableBody");
    const count = document.getElementById("memberCount");
    if (!tbody) return;

    if (count) count.innerText = list.length;

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty"><i class="fa-solid fa-user-slash"></i>कोणताही सभासद सापडला नाही.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";

    list.forEach((member,index) => {
        const memberId = getMemberId(member);
        const pending = getMemberPending(member);
        const subscription2026 = getMemberSubscriptionFrom2026(member);
        const donation2026 = getFinalMemberDonationFrom2026(member);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index+1}</td>
            <td><strong>${escapeDetailHTML(member.name)}</strong></td>
            <td>${escapeDetailHTML(memberId)}</td>
            <td>${escapeDetailHTML(member.wadi)}</td>
            <td>${escapeDetailHTML(member.mobile || "-")}</td>
            <td class="money pending-money">${formatDetailMoney(pending)}</td>
            <td class="money subscription-money">${formatDetailMoney(subscription2026)}</td>
            <td class="money donation-money">${formatDetailMoney(donation2026)}</td>
            <td><button type="button" class="view-btn"><i class="fa-solid fa-eye"></i> View</button></td>
        `;

        row.querySelector(".view-btn")?.addEventListener("click",() => showMemberDetails(member));
        tbody.appendChild(row);
    });
}

function searchMemberDetails() {
    loadMemberDetailsData();

    const input = document.getElementById("memberSearch");
    const keyword = normalizeDetailText(input?.value || "");

    let filtered = detailMembers;

    if (keyword) {
        filtered = detailMembers.filter(member => {
            return normalizeDetailText(member.name).includes(keyword) ||
                normalizeDetailText(getMemberId(member)).includes(keyword) ||
                normalizeDetailText(member.mobile).includes(keyword) ||
                normalizeDetailText(member.wadi).includes(keyword);
        });
    }

    const status = document.getElementById("searchStatus");
    if (status) status.innerText = keyword ? `Search: ${filtered.length} सभासद` : "सर्व सभासद";

    displayMemberDetailsList(filtered);
}

function showMemberDetails(member) {
    const modal = document.getElementById("memberModal");
    const content = document.getElementById("memberDetailsContent");
    if (!modal || !content) return;

    loadMemberDetailsData();

    const latestMember = findDetailMember(getMemberId(member)) || member;
    const memberId = getMemberId(latestMember);
    const pending = getMemberPending(latestMember);
    const subscription2026 = getMemberSubscriptionFrom2026(latestMember);
    const donation2026 = getFinalMemberDonationFrom2026(latestMember);

    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">सभासद नाव</div><div class="detail-value">${escapeDetailHTML(latestMember.name)}</div></div>
            <div class="detail-item"><div class="detail-label">Member ID</div><div class="detail-value">${escapeDetailHTML(memberId)}</div></div>
            <div class="detail-item"><div class="detail-label">वाडी</div><div class="detail-value">${escapeDetailHTML(latestMember.wadi || "-")}</div></div>
            <div class="detail-item"><div class="detail-label">Mobile</div><div class="detail-value">${escapeDetailHTML(latestMember.mobile || "-")}</div></div>
            <div class="detail-item detail-full"><div class="detail-label">पत्ता</div><div class="detail-value">${escapeDetailHTML(latestMember.address || "-")}</div></div>
        </div>

        <div class="amount-section">
            <div class="amount-section-title">आर्थिक माहिती</div>
            <div class="amount-grid">
                <div class="amount-card"><div class="label">बाकी वर्गणी</div><div class="amount pending-money">${formatDetailMoney(pending)}</div></div>
                <div class="amount-card"><div class="label">2026 पासून जमा वर्गणी</div><div class="amount subscription-money">${formatDetailMoney(subscription2026)}</div></div>
                <div class="amount-card"><div class="label">2026 पासून जमा देणगी</div><div class="amount donation-money">${formatDetailMoney(donation2026)}</div></div>
            </div>
        </div>
    `;

    modal.style.display = "block";
}

function closeMemberDetailsModal() {
    const modal = document.getElementById("memberModal");
    if (modal) modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded",() => {
    loadMemberDetailsData();
    displayMemberDetailsList(detailMembers);

    const search = document.getElementById("memberSearch");
    search?.addEventListener("input",searchMemberDetails);

    document.getElementById("clearSearch")?.addEventListener("click",() => {
        if (search) search.value = "";
        searchMemberDetails();
        search?.focus();
    });

    document.getElementById("closeModal")?.addEventListener("click",closeMemberDetailsModal);

    document.getElementById("memberModal")?.addEventListener("click",event => {
        if (event.target === document.getElementById("memberModal")) closeMemberDetailsModal();
    });
});

document.addEventListener("keydown",event => {
    if (event.key === "Escape") closeMemberDetailsModal();
});

window.addEventListener("storage",() => {
    loadMemberDetailsData();
    searchMemberDetails();
});

console.log("MGVM Member Details page loaded successfully.");
