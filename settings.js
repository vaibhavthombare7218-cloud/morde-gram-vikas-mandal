/* =========================================================
   settings.js
   मोर्डे ग्राम विकास मंडळ, मुंबई

   FEATURES
   1. All Data Backup
   2. Backup Upload / Restore
   3. Annual Subscription Amount
   4. Overall Changes Log
   5. Meeting WhatsApp Invitation
   6. Member-wise Pending WhatsApp Message
   7. Current Financial Year
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const SETTINGS_KEYS = {

    MEMBERS:
        "mgvm_members",

    SUBSCRIPTIONS:
        "mgvm_subscriptions",

    ANNUAL_AMOUNT:
        "mgvm_annual_subscription_amount",

    FINANCIAL_YEAR:
        "mgvm_current_financial_year",

    CHANGE_LOG:
        "mgvm_changes_log",

    LAST_BACKUP:
        "mgvm_last_backup"

};


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_ANNUAL_AMOUNT = 200;


/* =========================================================
   HELPER
========================================================= */

function $(id){

    return document.getElementById(id);

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message){

    const toast = $("toast");

    if(!toast){

        alert(message);

        return;
    }

    toast.textContent = message;

    toast.style.display = "block";

    clearTimeout(window.mgvmToastTimer);

    window.mgvmToastTimer = setTimeout(() => {

        toast.style.display = "none";

    },3000);

}


/* =========================================================
   SAFE JSON
========================================================= */

function getJSON(key, fallback = []){

    try{

        const value =
            localStorage.getItem(key);

        if(value === null){

            return fallback;
        }

        return JSON.parse(value);

    }catch(error){

        console.error(
            "JSON Read Error:",
            key,
            error
        );

        return fallback;
    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value){

    return String(value ?? "")

        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =========================================================
   DATE TIME
========================================================= */

function getDateTime(){

    const d = new Date();

    return d.toLocaleString(
        "mr-IN",
        {
            dateStyle:"medium",
            timeStyle:"short"
        }
    );

}


/* =========================================================
   CURRENT YEAR
========================================================= */

function getCurrentFinancialYear(){

    const today = new Date();

    let year = today.getFullYear();

    /*
       April नंतर नवीन Financial Year
    */

    if(today.getMonth() < 3){

        year = year - 1;

    }

    return `${year}-${String(year + 1).slice(-2)}`;

}


/* =========================================================
   FINANCIAL YEAR OPTIONS
========================================================= */

function loadFinancialYearOptions(){

    const select =
        $("financialYearSelect");

    if(!select) return;

    select.innerHTML = "";

    const current =
        new Date().getFullYear();

    const saved =
        localStorage.getItem(
            SETTINGS_KEYS.FINANCIAL_YEAR
        ) ||
        getCurrentFinancialYear();

    /*
       मागील 5 आणि पुढील 5 वर्षे
    */

    for(
        let year = current - 5;
        year <= current + 5;
        year++
    ){

        const fy =
            `${year}-${String(year + 1).slice(-2)}`;

        const option =
            document.createElement("option");

        option.value = fy;

        option.textContent = fy;

        if(fy === saved){

            option.selected = true;

        }

        select.appendChild(option);

    }

    $("currentFinancialYear").textContent =
        saved;

}


/* =========================================================
   ANNUAL AMOUNT
========================================================= */

function getAnnualAmount(){

    const value =
        Number(
            localStorage.getItem(
                SETTINGS_KEYS.ANNUAL_AMOUNT
            )
        );

    if(
        Number.isFinite(value) &&
        value >= 0
    ){

        return value;

    }

    return DEFAULT_ANNUAL_AMOUNT;

}


function loadAnnualAmount(){

    const amount =
        getAnnualAmount();

    $("currentAnnualAmount")
        .textContent =
        `₹${amount.toLocaleString("en-IN")}`;

    $("annualSubscriptionAmount")
        .value = amount;

}


/* =========================================================
   CHANGE LOG
========================================================= */

function getChangeLogs(){

    return getJSON(
        SETTINGS_KEYS.CHANGE_LOG,
        []
    );

}


function saveChangeLogs(logs){

    localStorage.setItem(
        SETTINGS_KEYS.CHANGE_LOG,
        JSON.stringify(logs)
    );

}


function addChangeLog(
    module,
    action,
    description
){

    const logs =
        getChangeLogs();

    logs.unshift({

        id:
            `LOG-${Date.now()}`,

        date:
            getDateTime(),

        module:
            module,

        action:
            action,

        description:
            description

    });

    /*
       Maximum 1000 logs
    */

    if(logs.length > 1000){

        logs.length = 1000;

    }

    saveChangeLogs(logs);

    renderChangeLogs();

}


function renderChangeLogs(){

    const body =
        $("changesLogBody");

    const empty =
        $("emptyLog");

    if(!body) return;

    const search =
        String(
            $("logSearch")?.value || ""
        )
        .trim()
        .toLowerCase();

    const logs =
        getChangeLogs();

    const filtered =
        logs.filter(log => {

            if(!search){

                return true;
            }

            return (

                String(log.module || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(log.action || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(log.description || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(log.date || "")
                    .toLowerCase()
                    .includes(search)

            );

        });


    body.innerHTML = "";


    if(!filtered.length){

        empty.style.display = "block";

        return;

    }


    empty.style.display = "none";


    filtered.forEach(log => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${escapeHTML(log.date)}
            </td>

            <td>
                <strong>
                    ${escapeHTML(log.module)}
                </strong>
            </td>

            <td>
                ${escapeHTML(log.action)}
            </td>

            <td>
                ${escapeHTML(log.description)}
            </td>

        `;

        body.appendChild(tr);

    });

}


/* =========================================================
   CLEAR LOG
========================================================= */

function clearChangeLogs(){

    const logs =
        getChangeLogs();

    if(!logs.length){

        showToast(
            "Delete करण्यासाठी Log उपलब्ध नाही."
        );

        return;
    }

    const confirmed =
        confirm(
            "सर्व Changes Log Delete करायचे आहेत का?\n\nही प्रक्रिया Undo करता येणार नाही."
        );

    if(!confirmed) return;


    localStorage.removeItem(
        SETTINGS_KEYS.CHANGE_LOG
    );


    renderChangeLogs();


    showToast(
        "सर्व Changes Log Delete झाले."
    );

}


/* =========================================================
   BACKUP
========================================================= */

function createFullBackup(){

    const data = {};

    for(
        let i = 0;
        i < localStorage.length;
        i++
    ){

        const key =
            localStorage.key(i);

        if(!key) continue;

        const raw =
            localStorage.getItem(key);

        /*
           JSON असेल तर object/array म्हणून save
        */

        try{

            data[key] =
                JSON.parse(raw);

        }catch(e){

            data[key] = raw;

        }

    }


    return {

        app:
            "मोर्डे ग्राम विकास मंडळ, मुंबई",

        version:
            "1.0",

        backupDate:
            new Date().toISOString(),

        backupDateLocal:
            getDateTime(),

        data:
            data

    };

}


/* =========================================================
   DOWNLOAD BACKUP
========================================================= */

function downloadBackup(){

    try{

        const backup =
            createFullBackup();


        const json =
            JSON.stringify(
                backup,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        const date =
            new Date();


        const fileDate =
            `${date.getFullYear()}-${String(
                date.getMonth()+1
            ).padStart(2,"0")}-${String(
                date.getDate()
            ).padStart(2,"0")}`;


        link.href = url;

        link.download =
            `MGVM-Full-Backup-${fileDate}.json`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);


        localStorage.setItem(
            SETTINGS_KEYS.LAST_BACKUP,
            new Date().toISOString()
        );


        addChangeLog(

            "Backup",

            "Download",

            "सर्व LocalStorage Data चा Full Backup Download केला."

        );


        updateBackupInfo();

        showToast(
            "Full Backup Download झाला."
        );

    }catch(error){

        console.error(
            "Backup Error:",
            error
        );

        alert(
            "Backup तयार करताना समस्या आली."
        );

    }

}


/* =========================================================
   BACKUP INFO
========================================================= */

function updateBackupInfo(){

    const members =
        getJSON(
            SETTINGS_KEYS.MEMBERS,
            []
        );

    const subscriptions =
        getJSON(
            SETTINGS_KEYS.SUBSCRIPTIONS,
            []
        );


    $("backupMembersCount")
        .textContent =
        members.length;


    $("backupSubscriptionCount")
        .textContent =
        subscriptions.length;


    $("backupKeysCount")
        .textContent =
        localStorage.length;


    const last =
        localStorage.getItem(
            SETTINGS_KEYS.LAST_BACKUP
        );


    if(last){

        const date =
            new Date(last);

        $("lastBackupInfo")
            .textContent =
            `शेवटचा Backup: ${
                date.toLocaleString("mr-IN")
            }`;

    }else{

        $("lastBackupInfo")
            .textContent =
            "शेवटचा Backup: उपलब्ध नाही.";

    }


    updateStorageSize();

}


/* =========================================================
   STORAGE SIZE
========================================================= */

function updateStorageSize(){

    let total = 0;


    for(
        let i=0;
        i<localStorage.length;
        i++
    ){

        const key =
            localStorage.key(i);

        const value =
            localStorage.getItem(key) || "";

        total +=
            (key.length + value.length) * 2;

    }


    let text;


    if(total < 1024){

        text =
            `${total} Bytes`;

    }
    else if(total < 1024 * 1024){

        text =
            `${(total / 1024).toFixed(2)} KB`;

    }
    else{

        text =
            `${(total / 1024 / 1024).toFixed(2)} MB`;

    }


    $("storageSizeInfo")
        .textContent =
        `Data Size: ${text}`;

}


/* =========================================================
   BACKUP FILE UPLOAD
========================================================= */

let selectedBackupData = null;


function handleBackupFile(event){

    const file =
        event.target.files?.[0];

    if(!file){

        selectedBackupData = null;

        $("restoreBackupBtn")
            .disabled = true;

        $("restorePreview")
            .style.display = "none";

        return;
    }


    $("selectedBackupFile")
        .textContent =
        `निवडलेली file: ${file.name}`;


    const reader =
        new FileReader();


    reader.onload = function(e){

        try{

            const backup =
                JSON.parse(
                    e.target.result
                );


            if(
                !backup ||
                typeof backup !== "object" ||
                !backup.data ||
                typeof backup.data !== "object"
            ){

                throw new Error(
                    "Invalid backup format"
                );

            }


            selectedBackupData =
                backup;


            showRestorePreview(
                backup
            );


            $("restoreBackupBtn")
                .disabled = false;


        }catch(error){

            console.error(
                "Backup Upload Error:",
                error
            );


            selectedBackupData =
                null;


            $("restoreBackupBtn")
                .disabled = true;


            $("restorePreview")
                .style.display = "none";


            alert(
                "ही valid MGVM Backup JSON file नाही."
            );

        }

    };


    reader.onerror = function(){

        alert(
            "Backup file read करताना समस्या आली."
        );

    };


    reader.readAsText(file);

}


/* =========================================================
   RESTORE PREVIEW
========================================================= */

function showRestorePreview(backup){

    const data =
        backup.data || {};


    let membersCount = 0;

    let subscriptionCount = 0;


    if(
        Array.isArray(
            data[SETTINGS_KEYS.MEMBERS]
        )
    ){

        membersCount =
            data[
                SETTINGS_KEYS.MEMBERS
            ].length;

    }


    if(
        Array.isArray(
            data[SETTINGS_KEYS.SUBSCRIPTIONS]
        )
    ){

        subscriptionCount =
            data[
                SETTINGS_KEYS.SUBSCRIPTIONS
            ].length;

    }


    $("previewDate")
        .textContent =
        backup.backupDateLocal ||
        backup.backupDate ||
        "-";


    $("previewMembers")
        .textContent =
        membersCount;


    $("previewSubscriptions")
        .textContent =
        subscriptionCount;


    $("previewKeys")
        .textContent =
        Object.keys(data).length;


    $("restorePreview")
        .style.display = "block";

}


/* =========================================================
   RESTORE BACKUP
========================================================= */

function restoreBackup(){

    if(!selectedBackupData){

        alert(
            "कृपया प्रथम Backup file निवडा."
        );

        return;
    }


    const data =
        selectedBackupData.data;


    const confirmed =
        confirm(

            "⚠️ IMPORTANT\n\n" +

            "Restore केल्यावर सध्याचा LocalStorage Data replace होईल.\n\n" +

            "तुम्ही आधी सध्याचा Backup घेतला आहे का?\n\n" +

            "Restore करायचा आहे का?"

        );


    if(!confirmed) return;


    try{

        /*
           Current data आधी backup object
           म्हणून सुरक्षित ठेवणे
        */

        const safetyBackup =
            createFullBackup();


        localStorage.setItem(

            "mgvm_auto_safety_backup",

            JSON.stringify(
                safetyBackup
            )

        );


        /*
           Backup मधील प्रत्येक key restore
        */

        Object.keys(data)
            .forEach(key => {

                const value =
                    data[key];


                if(
                    typeof value === "string"
                ){

                    localStorage.setItem(
                        key,
                        value
                    );

                }else{

                    localStorage.setItem(
                        key,
                        JSON.stringify(value)
                    );

                }

            });


        addChangeLog(

            "Backup",

            "Restore",

            `Backup Restore केला. Backup Date: ${
                selectedBackupData.backupDateLocal ||
                selectedBackupData.backupDate ||
                "-"
            }`

        );


        selectedBackupData =
            null;


        $("backupFile")
            .value = "";


        $("selectedBackupFile")
            .textContent =
            "कोणतीही Backup file निवडलेली नाही.";


        $("restoreBackupBtn")
            .disabled = true;


        $("restorePreview")
            .style.display = "none";


        updateBackupInfo();

        loadAnnualAmount();

        loadFinancialYearOptions();


        alert(
            "✅ Backup Restore पूर्ण झाला.\n\nPage reload होत आहे."
        );


        location.reload();


    }catch(error){

        console.error(
            "Restore Error:",
            error
        );


        alert(
            "Backup Restore करताना समस्या आली."
        );

    }

}


/* =========================================================
   SAVE ANNUAL AMOUNT
========================================================= */

function saveAnnualAmount(){

    const input =
        $("annualSubscriptionAmount");


    const amount =
        Number(input.value);


    if(
        !Number.isFinite(amount) ||
        amount < 0
    ){

        alert(
            "कृपया योग्य वर्गणी रक्कम टाका."
        );

        input.focus();

        return;
    }


    const oldAmount =
        getAnnualAmount();


    if(amount === oldAmount){

        showToast(
            "वर्गणी रक्कममध्ये कोणताही बदल नाही."
        );

        return;
    }


    localStorage.setItem(

        SETTINGS_KEYS.ANNUAL_AMOUNT,

        String(amount)

    );


    addChangeLog(

        "वर्गणी",

        "Amount Changed",

        `वार्षिक वर्गणी ₹${oldAmount} वरून ₹${amount} करण्यात आली.`

    );


    loadAnnualAmount();


    showToast(
        `वार्षिक वर्गणी ₹${amount} Save झाली.`
    );

}


/* =========================================================
   SAVE FINANCIAL YEAR
========================================================= */

function saveFinancialYear(){

    const select =
        $("financialYearSelect");


    const newYear =
        select.value;


    if(!newYear){

        alert(
            "कृपया Financial Year निवडा."
        );

        return;
    }


    const oldYear =
        localStorage.getItem(
            SETTINGS_KEYS.FINANCIAL_YEAR
        ) ||
        getCurrentFinancialYear();


    if(oldYear === newYear){

        showToast(
            "Financial Year मध्ये कोणताही बदल नाही."
        );

        return;
    }


    localStorage.setItem(

        SETTINGS_KEYS.FINANCIAL_YEAR,

        newYear

    );


    $("currentFinancialYear")
        .textContent =
        newYear;


    addChangeLog(

        "Financial Year",

        "Year Changed",

        `Financial Year ${oldYear} वरून ${newYear} करण्यात आले.`

    );


    showToast(
        `Current Financial Year: ${newYear}`
    );

}


/* =========================================================
   MEETING DATE FORMAT
========================================================= */

function formatDateMarathi(dateValue){

    if(!dateValue){

        return "________";
    }


    const parts =
        dateValue.split("-");


    if(parts.length !== 3){

        return dateValue;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =========================================================
   MEETING MESSAGE
========================================================= */

function createMeetingMessage(){

    const date =
        formatDateMarathi(
            $("meetingDate").value
        );


    const time =
        $("meetingTime").value ||
        "________";


    const place =
        $("meetingPlace").value.trim() ||
        "________";


    const subject =
        $("meetingSubject").value.trim() ||
        "महत्त्वाचे विषय";


    const message =

`🙏 *मोर्डे ग्राम विकास मंडळ, मुंबई* 🙏

📢 *सभेचे निमंत्रण*

सर्व सभासदांना कळविण्यात येते की मंडळाची सभा आयोजित करण्यात आली आहे.

📅 *दिनांक:* ${date}
⏰ *वेळ:* ${time}
📍 *ठिकाण:* ${place}

📝 *सभेचे विषय:*
${subject}

तरी सर्व सभासदांनी वेळेवर उपस्थित राहून सभेचा लाभ घ्यावा.

धन्यवाद! 🙏

*मोर्डे ग्राम विकास मंडळ, मुंबई*`;


    $("meetingMessage")
        .value =
        message;


    return message;

}


/* =========================================================
   COPY TEXT
========================================================= */

async function copyText(text){

    if(!text){

        showToast(
            "Copy करण्यासाठी Message उपलब्ध नाही."
        );

        return false;
    }


    try{

        await navigator.clipboard.writeText(
            text
        );

        showToast(
            "Message Copy झाला."
        );

        return true;

    }catch(error){

        /*
           Mobile / older browser fallback
        */

        const textarea =
            document.createElement("textarea");

        textarea.value =
            text;

        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";

        document.body.appendChild(
            textarea
        );

        textarea.focus();

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();


        showToast(
            "Message Copy झाला."
        );

        return true;

    }

}


/* =========================================================
   OPEN WHATSAPP
========================================================= */

function openWhatsApp(
    message,
    mobile = ""
){

    if(!message){

        showToast(
            "Message तयार करा."
        );

        return;
    }


    let phone =
        String(mobile || "")
            .replace(/\D/g,"");


    /*
       Indian number असल्यास +91 add
    */

    if(
        phone.length === 10
    ){

        phone =
            "91" + phone;

    }


    let url;


    if(
        phone.length >= 12
    ){

        url =
            `https://wa.me/${phone}?text=${
                encodeURIComponent(message)
            }`;

    }else{

        url =
            `https://wa.me/?text=${
                encodeURIComponent(message)
            }`;

    }


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   MEMBER DATA
========================================================= */

function getMembers(){

    return getJSON(
        SETTINGS_KEYS.MEMBERS,
        []
    );

}


let selectedPendingMember = null;


/* =========================================================
   MEMBER SEARCH
========================================================= */

function searchPendingMembers(){

    const keyword =
        String(
            $("pendingMemberSearch").value ||
            ""
        )
        .trim()
        .toLowerCase();


    const box =
        $("pendingMemberSuggestions");


    box.innerHTML = "";


    if(!keyword){

        box.style.display =
            "none";

        return;
    }


    const members =
        getMembers();


    const results =
        members
        .filter(member => {

            const id =
                String(member.id || "")
                    .toLowerCase();

            const name =
                String(member.name || "")
                    .toLowerCase();

            const wadi =
                String(member.wadi || "")
                    .toLowerCase();

            const mobile =
                String(member.mobile || "")
                    .toLowerCase();


            return (

                id.includes(keyword) ||

                name.includes(keyword) ||

                wadi.includes(keyword) ||

                mobile.includes(keyword)

            );

        })
        .slice(0,20);


    if(!results.length){

        box.innerHTML = `

            <div class="suggestion-item">

                <div class="suggestion-name">
                    सभासद सापडला नाही.
                </div>

            </div>

        `;

        box.style.display =
            "block";

        return;
    }


    results.forEach(member => {

        const div =
            document.createElement("div");


        div.className =
            "suggestion-item";


        div.innerHTML = `

            <div class="suggestion-name">

                ${escapeHTML(
                    member.name || "-"
                )}

            </div>

            <div class="suggestion-info">

                ID:
                ${escapeHTML(
                    member.id || "-"
                )}

                &nbsp; | &nbsp;

                वाडी:
                ${escapeHTML(
                    member.wadi || "-"
                )}

                &nbsp; | &nbsp;

                बाकी:
                ₹${Number(
                    member.subscriptionPending || 0
                ).toLocaleString("en-IN")}

            </div>

        `;


        div.addEventListener(
            "click",
            () => {

                selectPendingMember(
                    member
                );

            }
        );


        box.appendChild(div);

    });


    box.style.display =
        "block";

}


/* =========================================================
   SELECT MEMBER
========================================================= */

function selectPendingMember(member){

    selectedPendingMember =
        member;


    $("pendingMemberSuggestions")
        .style.display =
        "none";


    $("pendingMemberSearch")
        .value =
        member.name || "";


    $("pendingMemberName")
        .textContent =
        member.name || "-";


    $("pendingMemberId")
        .textContent =
        member.id || "-";


    $("pendingMemberWadi")
        .textContent =
        member.wadi || "-";


    $("pendingMemberMobile")
        .textContent =
        member.mobile || "-";


    const pending =
        getMemberPendingAmount(
            member
        );


    $("pendingMemberAmount")
        .textContent =
        `₹${pending.toLocaleString("en-IN")}`;


    createPendingMemberMessage();

}


/* =========================================================
   PENDING AMOUNT
========================================================= */

function getMemberPendingAmount(member){

    /*
       Existing members.js मध्ये
       subscriptionPending field वापरला जातो.
    */

    const pending =
        Number(
            member.subscriptionPending || 0
        );


    if(
        Number.isFinite(pending) &&
        pending >= 0
    ){

        return pending;

    }


    return 0;

}


/* =========================================================
   MEMBER PENDING MESSAGE
========================================================= */

function createPendingMemberMessage(){

    if(!selectedPendingMember){

        $("pendingMemberMessage")
            .value =
            "";

        return;
    }


    const member =
        selectedPendingMember;


    const pending =
        getMemberPendingAmount(
            member
        );


    const message =

`🙏 नमस्कार ${member.name || "सभासद"} जी,

*मोर्डे ग्राम विकास मंडळ, मुंबई*

आपल्या सभासद वर्गणीची खालीलप्रमाणे बाकी आहे:

👤 *सभासद:* ${member.name || "-"}
🆔 *Member ID:* ${member.id || "-"}
🏘️ *वाडी:* ${member.wadi || "-"}

💰 *एकूण बाकी वर्गणी: ₹${pending.toLocaleString("en-IN")}*

कृपया आपली बाकी वर्गणी शक्य तितक्या लवकर जमा करावी.

आपल्या सहकार्याबद्दल धन्यवाद! 🙏

*मोर्डे ग्राम विकास मंडळ, मुंबई*`;


    $("pendingMemberMessage")
        .value =
        message;

}


/* =========================================================
   GENERATE MEETING
========================================================= */

function generateMeeting(){

    const message =
        createMeetingMessage();


    addChangeLog(

        "WhatsApp",

        "Meeting Message",

        "Meeting WhatsApp invitation message तयार केला."

    );


    showToast(
        "Meeting Message तयार झाला."
    );

}


/* =========================================================
   GENERATE PENDING MESSAGE
========================================================= */

function generatePendingMessage(){

    if(!selectedPendingMember){

        alert(
            "कृपया प्रथम सभासद निवडा."
        );

        return;
    }


    createPendingMemberMessage();


    addChangeLog(

        "WhatsApp",

        "Pending Message",

        `${selectedPendingMember.name || "सभासद"} यांच्यासाठी बाकी वर्गणी WhatsApp message तयार केला.`

    );


    showToast(
        "बाकी वर्गणी Message तयार झाला."
    );

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function bindEvents(){

    /*
       Backup
    */

    $("downloadBackupBtn")
        .addEventListener(
            "click",
            downloadBackup
        );


    $("refreshBackupInfoBtn")
        .addEventListener(
            "click",
            updateBackupInfo
        );


    $("backupFile")
        .addEventListener(
            "change",
            handleBackupFile
        );


    $("restoreBackupBtn")
        .addEventListener(
            "click",
            restoreBackup
        );


    /*
       Annual Amount
    */

    $("saveAnnualAmountBtn")
        .addEventListener(
            "click",
            saveAnnualAmount
        );


    /*
       Logs
    */

    $("logSearch")
        .addEventListener(
            "input",
            renderChangeLogs
        );


    $("refreshLogsBtn")
        .addEventListener(
            "click",
            renderChangeLogs
        );


    $("clearLogsBtn")
        .addEventListener(
            "click",
            clearChangeLogs
        );


    /*
       Meeting
    */

    $("generateMeetingBtn")
        .addEventListener(
            "click",
            generateMeeting
        );


    $("copyMeetingBtn")
        .addEventListener(
            "click",
            () => {

                copyText(
                    $("meetingMessage").value
                );

            }
        );


    $("whatsappMeetingBtn")
        .addEventListener(
            "click",
            () => {

                const message =
                    $("meetingMessage").value ||
                    createMeetingMessage();


                openWhatsApp(
                    message
                );

            }
        );


    /*
       Member Pending
    */

    $("pendingMemberSearch")
        .addEventListener(
            "input",
            searchPendingMembers
        );


    $("generatePendingMessageBtn")
        .addEventListener(
            "click",
            generatePendingMessage
        );


    $("copyPendingMessageBtn")
        .addEventListener(
            "click",
            () => {

                copyText(
                    $("pendingMemberMessage").value
                );

            }
        );


    $("whatsappPendingBtn")
        .addEventListener(
            "click",
            () => {

                if(!selectedPendingMember){

                    alert(
                        "कृपया प्रथम सभासद निवडा."
                    );

                    return;
                }


                const message =
                    $("pendingMemberMessage").value ||
                    createPendingMemberMessage();


                openWhatsApp(

                    message,

                    selectedPendingMember.mobile

                );

            }
        );


    /*
       Financial Year
    */

    $("saveFinancialYearBtn")
        .addEventListener(
            "click",
            saveFinancialYear
        );


    /*
       Click outside member suggestions
    */

    document.addEventListener(
        "click",
        function(event){

            const wrapper =
                document.querySelector(
                    ".member-search-wrapper"
                );


            if(
                wrapper &&
                !wrapper.contains(
                    event.target
                )
            ){

                $("pendingMemberSuggestions")
                    .style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   BACK BUTTON
========================================================= */

function goBack(){

    if(
        document.referrer &&
        document.referrer !== location.href
    ){

        history.back();

    }else{

        location.href =
            "index.html";

    }

}


/* =========================================================
   INIT
========================================================= */

function initSettings(){

    loadAnnualAmount();

    loadFinancialYearOptions();

    renderChangeLogs();

    updateBackupInfo();

    bindEvents();

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initSettings
);
