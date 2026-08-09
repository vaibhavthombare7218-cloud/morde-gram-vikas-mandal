/* =========================================================
   database.js
   मोर्डे ग्राम विकास मंडळ, मुंबई
   Central LocalStorage Database
========================================================= */


/* =========================================================
   DATABASE KEYS
========================================================= */

const MGVM_DB_KEYS = {

    MEMBERS:
        "mgvm_members",

    SUBSCRIPTIONS:
        "mgvm_subscriptions",

    DONATIONS:
        "mgvm_donations",

    INCOME:
        "mgvm_income",

    EXPENSE:
        "mgvm_expense",

    MEETINGS:
        "mgvm_meetings",

    SETTINGS:
        "mgvm_settings"

};


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const MGVM_DEFAULT_SETTINGS = {

    organizationName:
        "मोर्डे ग्राम विकास मंडळ, मुंबई",

    annualSubscription:
        200,

    financialYearStartMonth:
        4,

    currency:
        "₹"

};


/* =========================================================
   SAFE JSON READ
========================================================= */

function mgvmRead(key, defaultValue = []) {

    try {

        const data =
            localStorage.getItem(key);


        if (
            data === null ||
            data === ""
        ) {

            return defaultValue;

        }


        const parsed =
            JSON.parse(data);


        return parsed;

    }
    catch (error) {

        console.error(
            "MGVM Database Read Error:",
            key,
            error
        );


        return defaultValue;

    }

}


/* =========================================================
   SAFE JSON WRITE
========================================================= */

function mgvmWrite(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );


        return true;

    }
    catch (error) {

        console.error(
            "MGVM Database Write Error:",
            key,
            error
        );


        alert(
            "Data save करताना समस्या आली.\n" +
            "Browser Storage पूर्ण भरलेले असू शकते."
        );


        return false;

    }

}


/* =========================================================
   INITIALIZE DATABASE
========================================================= */

function initializeMGVMDatabase() {

    /*
       Existing data असेल तर ते तसेच ठेवले जाईल.
       नवीन key नसेल तरच तयार केली जाईल.
    */


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.MEMBERS
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.MEMBERS,
            []
        );

    }


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.SUBSCRIPTIONS
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.SUBSCRIPTIONS,
            []
        );

    }


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.DONATIONS
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.DONATIONS,
            []
        );

    }


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.INCOME
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.INCOME,
            []
        );

    }


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.EXPENSE
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.EXPENSE,
            []
        );

    }


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.MEETINGS
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.MEETINGS,
            []
        );

    }


    if (
        localStorage.getItem(
            MGVM_DB_KEYS.SETTINGS
        ) === null
    ) {

        mgvmWrite(
            MGVM_DB_KEYS.SETTINGS,
            MGVM_DEFAULT_SETTINGS
        );

    }

}


/* =========================================================
   GET MEMBERS
========================================================= */

function getMGVMMembers() {

    return mgvmRead(
        MGVM_DB_KEYS.MEMBERS,
        []
    );

}


/* =========================================================
   SAVE MEMBERS
========================================================= */

function saveMGVMMembers(members) {

    return mgvmWrite(
        MGVM_DB_KEYS.MEMBERS,
        members
    );

}


/* =========================================================
   GET SUBSCRIPTIONS
========================================================= */

function getMGVMSubscriptions() {

    return mgvmRead(
        MGVM_DB_KEYS.SUBSCRIPTIONS,
        []
    );

}


/* =========================================================
   SAVE SUBSCRIPTIONS
========================================================= */

function saveMGVMSubscriptions(
    subscriptions
) {

    return mgvmWrite(
        MGVM_DB_KEYS.SUBSCRIPTIONS,
        subscriptions
    );

}


/* =========================================================
   GET DONATIONS
========================================================= */

function getMGVMDONATIONS() {

    return mgvmRead(
        MGVM_DB_KEYS.DONATIONS,
        []
    );

}


/* =========================================================
   SAVE DONATIONS
========================================================= */

function saveMGVMDONATIONS(
    donations
) {

    return mgvmWrite(
        MGVM_DB_KEYS.DONATIONS,
        donations
    );

}


/* =========================================================
   GET INCOME
========================================================= */

function getMGVMIncome() {

    return mgvmRead(
        MGVM_DB_KEYS.INCOME,
        []
    );

}


/* =========================================================
   SAVE INCOME
========================================================= */

function saveMGVMIncome(
    income
) {

    return mgvmWrite(
        MGVM_DB_KEYS.INCOME,
        income
    );

}


/* =========================================================
   GET EXPENSE
========================================================= */

function getMGVMExpense() {

    return mgvmRead(
        MGVM_DB_KEYS.EXPENSE,
        []
    );

}


/* =========================================================
   SAVE EXPENSE
========================================================= */

function saveMGVMExpense(
    expense
) {

    return mgvmWrite(
        MGVM_DB_KEYS.EXPENSE,
        expense
    );

}


/* =========================================================
   GET MEETINGS
========================================================= */

function getMGVMMeetings() {

    return mgvmRead(
        MGVM_DB_KEYS.MEETINGS,
        []
    );

}


/* =========================================================
   SAVE MEETINGS
========================================================= */

function saveMGVMMeetings(
    meetings
) {

    return mgvmWrite(
        MGVM_DB_KEYS.MEETINGS,
        meetings
    );

}


/* =========================================================
   GET SETTINGS
========================================================= */

function getMGVMSettings() {

    const settings =
        mgvmRead(
            MGVM_DB_KEYS.SETTINGS,
            {}
        );


    return {

        ...MGVM_DEFAULT_SETTINGS,

        ...settings

    };

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveMGVMSettings(
    settings
) {

    const current =
        getMGVMSettings();


    const updated = {

        ...current,

        ...settings

    };


    return mgvmWrite(
        MGVM_DB_KEYS.SETTINGS,
        updated
    );

}


/* =========================================================
   ANNUAL SUBSCRIPTION AMOUNT
========================================================= */

function getAnnualSubscriptionAmount() {

    const settings =
        getMGVMSettings();


    return Number(
        settings.annualSubscription
    ) || 200;

}


/* =========================================================
   GENERATE MEMBER ID
========================================================= */

function generateMGVMMemberId() {

    const members =
        getMGVMMembers();


    let maxNumber = 0;


    members.forEach(
        function(member) {

            const match =
                String(
                    member.id || ""
                )
                .match(
                    /MGVM-(\d+)/i
                );


            if (match) {

                const number =
                    parseInt(
                        match[1],
                        10
                    );


                if (
                    number >
                    maxNumber
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
        ).padStart(
            4,
            "0"
        )
    );

}


/* =========================================================
   GENERATE SUBSCRIPTION ID
========================================================= */

function generateMGVMSubscriptionId() {

    return (
        "SUB-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


/* =========================================================
   GENERATE RECEIPT NUMBER
========================================================= */

function generateMGVMReceiptNumber() {

    const subscriptions =
        getMGVMSubscriptions();


    let maxNumber = 0;


    subscriptions.forEach(
        function(item) {

            const match =
                String(
                    item.receiptNo || ""
                )
                .match(
                    /MGVM-REC-(\d+)/i
                );


            if (match) {

                const number =
                    parseInt(
                        match[1],
                        10
                    );


                if (
                    number >
                    maxNumber
                ) {

                    maxNumber =
                        number;

                }

            }

        }
    );


    return (
        "MGVM-REC-" +
        String(
            maxNumber + 1
        ).padStart(
            4,
            "0"
        )
    );

}


/* =========================================================
   FIND MEMBER BY ID
========================================================= */

function findMGVMMemberById(
    memberId
) {

    const members =
        getMGVMMembers();


    return members.find(
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
    ) || null;

}


/* =========================================================
   FIND MEMBER BY NAME
========================================================= */

function findMGVMMemberByName(
    name
) {

    const members =
        getMGVMMembers();


    const search =
        String(
            name || ""
        )
        .trim()
        .toLowerCase();


    return members.find(
        function(member) {

            return (
                String(
                    member.name || ""
                )
                .trim()
                .toLowerCase()
                === search
            );

        }
    ) || null;

}


/* =========================================================
   CALCULATE MEMBER PAID AMOUNT
========================================================= */

function getMemberPaidAmount(
    memberId,
    year
) {

    const subscriptions =
        getMGVMSubscriptions();


    return subscriptions
        .filter(
            function(item) {

                return (
                    String(
                        item.memberId
                    ) ===
                    String(
                        memberId
                    ) &&

                    (
                        !year ||
                        item.year === year
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


/* =========================================================
   CALCULATE YEAR PENDING
========================================================= */

function getMGVMYearPending(
    memberId,
    year
) {

    const annual =
        getAnnualSubscriptionAmount();


    const paid =
        getMemberPaidAmount(
            memberId,
            year
        );


    return Math.max(
        0,
        annual - paid
    );

}


/* =========================================================
   CALCULATE ALL MEMBER PENDING
========================================================= */

function calculateMGVMMemberPending(
    memberId
) {

    const subscriptions =
        getMGVMSubscriptions();


    const annual =
        getAnnualSubscriptionAmount();


    const years = [];


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
        .forEach(
            function(item) {

                if (
                    item.year &&
                    !years.includes(
                        item.year
                    )
                ) {

                    years.push(
                        item.year
                    );

                }

            }
        );


    let pending = 0;


    years.forEach(
        function(year) {

            const paid =
                getMemberPaidAmount(
                    memberId,
                    year
                );


            pending +=
                Math.max(
                    0,
                    annual - paid
                );

        }
    );


    return pending;

}


/* =========================================================
   UPDATE ALL MEMBER PENDING
========================================================= */

function updateMGVMAllMemberPending() {

    const members =
        getMGVMMembers();


    members.forEach(
        function(member) {

            member.subscriptionPending =
                calculateMGVMMemberPending(
                    member.id
                );

        }
    );


    saveMGVMMembers(
        members
    );


    return members;

}


/* =========================================================
   DATABASE SUMMARY
========================================================= */

function getMGVMSummary() {

    const members =
        getMGVMMembers();


    const subscriptions =
        getMGVMSubscriptions();


    const donations =
        getMGVMDONATIONS();


    const income =
        getMGVMIncome();


    const expense =
        getMGVMExpense();


    const totalSubscription =
        subscriptions.reduce(
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


    const totalDonation =
        donations.reduce(
            function(
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


    const totalIncome =
        income.reduce(
            function(
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


    const totalExpense =
        expense.reduce(
            function(
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


    return {

        totalMembers:
            members.length,

        totalSubscription:
            totalSubscription,

        totalDonation:
            totalDonation,

        totalIncome:
            totalIncome,

        totalExpense:
            totalExpense,

        balance:
            (
                totalSubscription +
                totalDonation +
                totalIncome -
                totalExpense
            )

    };

}


/* =========================================================
   BACKUP ALL DATABASE
========================================================= */

function exportMGVMDatabase() {

    const database = {

        version:
            "1.0",

        exportedAt:
            new Date().toISOString(),

        members:
            getMGVMMembers(),

        subscriptions:
            getMGVMSubscriptions(),

        donations:
            getMGVMDONATIONS(),

        income:
            getMGVMIncome(),

        expense:
            getMGVMExpense(),

        meetings:
            getMGVMMeetings(),

        settings:
            getMGVMSettings()

    };


    return database;

}


/* =========================================================
   RESTORE DATABASE
========================================================= */

function importMGVMDatabase(
    database
) {

    if (
        !database ||
        typeof database !==
        "object"
    ) {

        return false;

    }


    if (
        Array.isArray(
            database.members
        )
    ) {

        saveMGVMMembers(
            database.members
        );

    }


    if (
        Array.isArray(
            database.subscriptions
        )
    ) {

        saveMGVMSubscriptions(
            database.subscriptions
        );

    }


    if (
        Array.isArray(
            database.donations
        )
    ) {

        saveMGVMDONATIONS(
            database.donations
        );

    }


    if (
        Array.isArray(
            database.income
        )
    ) {

        saveMGVMIncome(
            database.income
        );

    }


    if (
        Array.isArray(
            database.expense
        )
    ) {

        saveMGVMExpense(
            database.expense
        );

    }


    if (
        Array.isArray(
            database.meetings
        )
    ) {

        saveMGVMMeetings(
            database.meetings
        );

    }


    if (
        database.settings
    ) {

        saveMGVMSettings(
            database.settings
        );

    }


    return true;

}


/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

initializeMGVMDatabase();


/* =========================================================
   CONSOLE MESSAGE
========================================================= */

console.log(
    "MGVM Database initialized successfully."
);
