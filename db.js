/**
 * Global InfoCity TechPark — Commercial Building Owner & Leasing IndexedDB Engine (db.js)
 * Database: GlobalInfoCity_DB (Version 2)
 */

const DB_NAME = "GlobalInfoCity_DB";
const DB_VERSION = 3;

const STORE_MAP = {
    "infocity_users": { store: "users", keyPath: "username" },
    "infocity_leases": { store: "leases", keyPath: "id" },
    "infocity_compliance": { store: "building_compliance", keyPath: "id" },
    "infocity_finance_reports": { store: "finance_reports", keyPath: "id" },
    "infocity_audit_logs": { store: "audit_logs", keyPath: "id" },
    "infocity_sys_config": { store: "sys_config", keyPath: "configKey" },
    "infocity_user_applications": { store: "user_applications", keyPath: "id" },
    "infocity_marketing": { store: "marketing_records", keyPath: "id" },
    "infocity_facility_amenities": { store: "facility_amenities", keyPath: "id" },
    "infocity_hr_operations": { store: "hr_operations", keyPath: "id" },
    "infocity_email_outbox": { store: "email_outbox", keyPath: "id" }
};

let dbInstance = null;
const nativeSetItem = Storage.prototype.setItem;

const SEED_USERS = [
    { name: "Aditya Ram", username: "admin_aditya", email: "admin@globalinfocity.demo", password: "Super@123", role: "SuperAdmin", status: "Active", scope: "BUILDING_OWNER_FULL_CONTROL" },
    { name: "Karthik Raja", username: "sales_karthik", email: "sales@globalinfocity.demo", password: "Sales@123", role: "Sales", status: "Active", scope: "LEADS_CALL_FOLLOWUP" },
    { name: "Priya Darshini", username: "mgr_priya", email: "manager@globalinfocity.demo", password: "Mgr@123", role: "Sales Manager", status: "Active", scope: "QUOTATION_BOOKED_CONTROL" },
    { name: "Arun Kumar", username: "fin_arun", email: "finance@globalinfocity.demo", password: "Fin@123", role: "Finance", status: "Active", scope: "BOOKED_INVOICING_PNL" },
    { name: "Divya Bharathi", username: "hr_divya", email: "hr@globalinfocity.demo", password: "Hr@123", role: "HR", status: "Active", scope: "TECHPARK_STAFF_HR" },
    { name: "Sanjay Kumar", username: "marketing_sanjay", email: "marketing@globalinfocity.demo", password: "Market@123", role: "Marketing", status: "Active", scope: "BRAND_SOCIAL_CAMPAIGNS" }
];

// Enriched 6-Stage Commercial Leases with Full Owner Due Diligence, Legal, Tax & Utility Fields
const SEED_LEASES = [
    {
        id: 1001,
        company: "Zoho Enterprise Systems",
        source: "Website",
        towerUnit: "Tower A - Floor 4 (20,000 sq.ft)",
        sqft: 20000,
        ratePerSqft: 85,
        discountPct: 5,
        stage: "Booked",
        rep: "Karthik Raja",
        quoteStatus: "Approved & Booked",
        invoiceStatus: "Invoiced",
        fitoutCost: 620000,
        notes: "5-year lock-in signed. Handed over for fit-out.",
        // Pillar 1: Tenant Screening & Due Diligence
        viabilityStatus: "Verified (AAA Credit & ₹50L Bank Guarantee)",
        companyPan: "AAACZ1234A",
        gstin: "33AAACZ1234A1Z5",
        cinNo: "U72200TN2010PTC074123",
        signatoryKyc: "Signatory PAN: BNZPM4412K | UIDAI: [Aadhaar Redacted]",
        permittedUse: "IT/ITeS Software Development Office",
        kycApproved: "Approved",
        // Pillar 2: Commercial Lease Agreement
        tenureMonths: 60,
        lockInMonths: 36,
        elapsedMonths: 14,
        noticeMonths: 3,
        escalationRule: "15% every 3 Years",
        subLeaseAllowed: "Strictly Prohibited (No NOC)",
        sroRegNo: "SRO-NEELANKARAI-4821/2025 (Registered)",
        // Pillar 3: Security Deposit, GST, TDS & CAM
        depositMonths: 8,
        camPerSqft: 14,
        form26asStatus: "Reconciled (Q3 FY26-27)",
        // Pillar 4: Utilities & Fit-Out
        ebMeterNo: "TNEB-HT-09-44102",
        ebHandoverReading: "14,250 kWh",
        waterMeterNo: "CMWSSB-COM-881",
        waterHandoverReading: "820 kL",
        fitoutCompliance: "Approved (Warm-Shell Restoration Clause Signed)",
        tenantInsurance: "Active (Policy #ICICI-EQ-99201)"
    },
    {
        id: 1002,
        company: "Freshworks AI Labs",
        source: "WhatsApp",
        towerUnit: "Tower B - Floor 7 (15,000 sq.ft)",
        sqft: 15000,
        ratePerSqft: 82,
        discountPct: 8,
        stage: "Quotation",
        rep: "Karthik Raja",
        quoteStatus: "Pending Manager Approval",
        invoiceStatus: "Pending",
        fitoutCost: 480000,
        notes: "Client requested 8% rent waiver on base warm-shell rate.",
        viabilityStatus: "Audited 3-Yr Balance Sheet Verified",
        companyPan: "AABCF8821L",
        gstin: "33AABCF8821L1Z2",
        cinNo: "U72900TN2014PTC091140",
        signatoryKyc: "Signatory PAN: CXYPK9012M | UIDAI: [Aadhaar Redacted]",
        permittedUse: "AI R&D & Cloud Operations Center",
        kycApproved: "Approved",
        tenureMonths: 60,
        lockInMonths: 36,
        elapsedMonths: 0,
        noticeMonths: 3,
        escalationRule: "6% Annually",
        subLeaseAllowed: "Strictly Prohibited (No NOC)",
        sroRegNo: "Draft Deed Ready for SRO Stamp Duty",
        depositMonths: 6,
        camPerSqft: 14,
        form26asStatus: "Awaiting First Billing",
        ebMeterNo: "TNEB-HT-09-44107",
        ebHandoverReading: "9,110 kWh",
        waterMeterNo: "CMWSSB-COM-887",
        waterHandoverReading: "410 kL",
        fitoutCompliance: "Pending Structural Engineer Review",
        tenantInsurance: "Pending Submission"
    },
    {
        id: 1003,
        company: "PayPal Chennai ODC",
        source: "Referral",
        towerUnit: "Tower A - Floor 9 (30,000 sq.ft)",
        sqft: 30000,
        ratePerSqft: 90,
        discountPct: 10,
        stage: "Booked",
        rep: "Sneha Nair",
        quoteStatus: "Approved & Booked",
        invoiceStatus: "Invoiced",
        fitoutCost: 950000,
        notes: "Full floor plate leased with 10-month security deposit.",
        viabilityStatus: "Verified Global MNC (₹1.5Cr Bank Guarantee)",
        companyPan: "AADCP9910F",
        gstin: "33AADCP9910F1Z9",
        cinNo: "U72200TN2008FTC061902",
        signatoryKyc: "Signatory PAN: DFGPP2219R | UIDAI: [Aadhaar Redacted]",
        permittedUse: "Global FinTech Offshore Development Center",
        kycApproved: "Approved",
        tenureMonths: 60,
        lockInMonths: 36,
        elapsedMonths: 8,
        noticeMonths: 3,
        escalationRule: "15% every 3 Years",
        subLeaseAllowed: "Strictly Prohibited (No NOC)",
        sroRegNo: "SRO-NEELANKARAI-5109/2026 (Registered)",
        depositMonths: 10,
        camPerSqft: 14,
        form26asStatus: "Reconciled (Q3 FY26-27)",
        ebMeterNo: "TNEB-HT-09-44109",
        ebHandoverReading: "28,900 kWh",
        waterMeterNo: "CMWSSB-COM-889",
        waterHandoverReading: "1,540 kL",
        fitoutCompliance: "Approved (Zero Load-Bearing Alteration)",
        tenantInsurance: "Active (Policy #HDFC-COM-77412)"
    },
    {
        id: 1004,
        company: "Cognizant Cloud Wing",
        source: "Instagram",
        towerUnit: "Tower C - Floor 2 (12,000 sq.ft)",
        sqft: 12000,
        ratePerSqft: 78,
        discountPct: 0,
        stage: "Follow Up",
        rep: "Karthik Raja",
        quoteStatus: "Not Requested",
        invoiceStatus: "Pending",
        fitoutCost: 390000,
        notes: "Site visit completed with facility head; awaiting seat layout confirmation.",
        viabilityStatus: "Verified Enterprise Track Record",
        companyPan: "AAACC4491E",
        gstin: "33AAACC4491E1Z1",
        cinNo: "U72300TN2002PTC049811",
        signatoryKyc: "Signatory PAN: KLMPC1108Q | UIDAI: [Aadhaar Redacted]",
        permittedUse: "IT Cloud Support & Operations",
        kycApproved: "Pending Final Board Resolution",
        tenureMonths: 36,
        lockInMonths: 24,
        elapsedMonths: 0,
        noticeMonths: 2,
        escalationRule: "5% Annually",
        subLeaseAllowed: "Strictly Prohibited",
        sroRegNo: "Pending Lease Execution",
        depositMonths: 6,
        camPerSqft: 14,
        form26asStatus: "Not Applicable",
        ebMeterNo: "TNEB-LT-03-11202",
        ebHandoverReading: "5,400 kWh",
        waterMeterNo: "CMWSSB-COM-902",
        waterHandoverReading: "290 kL",
        fitoutCompliance: "Standard Warm-Shell Handover",
        tenantInsurance: "Not Required Yet"
    },
    {
        id: 1005,
        company: "SpiceRoute Cloud Kitchens Pvt Ltd",
        source: "Direct",
        towerUnit: "Tower C - Floor 1 (8,000 sq.ft)",
        sqft: 8000,
        ratePerSqft: 75,
        discountPct: 0,
        stage: "Lost",
        rep: "Vikram Seth",
        quoteStatus: "Rejected (Permitted Use Violation)",
        invoiceStatus: "Cancelled",
        fitoutCost: 250000,
        notes: "Rejected by SuperAdmin: Heavy commercial exhaust & LPG kitchen prohibited in IT TechPark.",
        viabilityStatus: "High Risk / High Wear-and-Tear",
        companyPan: "AAICS7712D",
        gstin: "33AAICS7712D1Z4",
        cinNo: "U55101TN2023PTC158920",
        signatoryKyc: "Signatory PAN: RTUPS8812N | UIDAI: [Aadhaar Redacted]",
        permittedUse: "PROHIBITED: Commercial Cloud Kitchen / Heavy Exhaust",
        kycApproved: "Rejected (Permitted Use Violation)",
        tenureMonths: 36,
        lockInMonths: 12,
        elapsedMonths: 0,
        noticeMonths: 2,
        escalationRule: "5% Annually",
        subLeaseAllowed: "Strictly Prohibited",
        sroRegNo: "Rejected",
        depositMonths: 6,
        camPerSqft: 14,
        form26asStatus: "N/A",
        ebMeterNo: "TNEB-LT-03-11201",
        ebHandoverReading: "3,120 kWh",
        waterMeterNo: "CMWSSB-COM-901",
        waterHandoverReading: "180 kL",
        fitoutCompliance: "Rejected (Requested Structural Ducting Cut)",
        tenantInsurance: "N/A"
    }
];

// Pillar 4 & 5: Building Fire Safety, Municipal Property Tax & Master Insurance Seed
const SEED_COMPLIANCE = [
    {
        id: 1,
        category: "Fire & Safety Compliance",
        item: "Tamil Nadu Fire & Rescue Services — Master Fire NOC",
        referenceNo: "TNFRS/CHENNAI/NOC/2026/8841",
        validityOrCycle: "Valid till 31-Oct-2027",
        amountPaid: 45000,
        status: "Compliant & Active"
    },
    {
        id: 2,
        category: "Fire & Safety Compliance",
        item: "Smoke Detectors, Sprinklers, CO2 Extinguishers & 24x7 Common CCTV",
        referenceNo: "AMC-HONEYWELL-2026-Q4",
        validityOrCycle: "Quarterly Audit Passed",
        amountPaid: 185000,
        status: "Compliant & Active"
    },
    {
        id: 3,
        category: "Property Tax & Municipal Dues",
        item: "Greater Chennai Corporation (GCC) — Commercial Property Tax (H2 FY26-27)",
        referenceNo: "GCC-ZONE14-BILL-992014",
        validityOrCycle: "Half-Yearly (Oct 2026 – Mar 2027)",
        amountPaid: 1480000,
        status: "Paid On Time"
    },
    {
        id: 4,
        category: "Property Tax & Municipal Dues",
        item: "CMWSSB Commercial Water & Sewage Tax (Towers A, B, C)",
        referenceNo: "CMWSSB-OMR-774120",
        validityOrCycle: "Half-Yearly Assessment",
        amountPaid: 420000,
        status: "Paid On Time"
    },
    {
        id: 5,
        category: "Building Master Insurance",
        item: "Commercial Structure Fire, Natural Disaster & STFI Policy (₹250 Cr Cover)",
        referenceNo: "NEWINDIA-COM-FIRE-551902",
        validityOrCycle: "Annual Policy (Exp: Dec 2027)",
        amountPaid: 960000,
        status: "Active Policy"
    },
    {
        id: 6,
        category: "Building Master Insurance",
        item: "Third-Party Public Liability Insurance (Common Lobbies, Elevators & Parking)",
        referenceNo: "TATA-AIG-PUB-331094",
        validityOrCycle: "Annual Policy (Exp: Dec 2027)",
        amountPaid: 310000,
        status: "Active Policy"
    }
];

function calcNetMonthlyRent(lease) {
    const gross = Number(lease.sqft || 0) * Number(lease.ratePerSqft || 0);
    const disc = Number(lease.discountPct || 0);
    return Math.round(gross * (1 - disc / 100));
}

function initInfoCityIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("users")) {
                const uStore = db.createObjectStore("users", { keyPath: "username" });
                uStore.createIndex("by_role", "role", { unique: false });
            }
            if (!db.objectStoreNames.contains("leases")) {
                const lStore = db.createObjectStore("leases", { keyPath: "id" });
                lStore.createIndex("by_stage", "stage", { unique: false });
                lStore.createIndex("by_rep", "rep", { unique: false });
            }
            if (!db.objectStoreNames.contains("building_compliance")) {
                db.createObjectStore("building_compliance", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("finance_reports")) {
                db.createObjectStore("finance_reports", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("audit_logs")) {
                db.createObjectStore("audit_logs", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("sys_config")) {
                db.createObjectStore("sys_config", { keyPath: "configKey" });
            }
            // Additive v3 stores. Existing records and the original stores are preserved.
            for (const meta of Object.values(STORE_MAP)) {
                if (!db.objectStoreNames.contains(meta.store)) {
                    db.createObjectStore(meta.store, { keyPath: meta.keyPath });
                }
            }
        };

        request.onsuccess = async function (event) {
            dbInstance = event.target.result;
            await hydrateAndSyncStores();
            renderIDBStatusBadge(true);
            resolve(dbInstance);
        };

        request.onerror = function (event) {
            console.error("IndexedDB Error:", event.target.error);
            renderIDBStatusBadge(false);
            reject(event.target.error);
        };
    });
}

function writeToObjectStore(storeName, keyPath, rawData) {
    if (!dbInstance) return;
    const tx = dbInstance.transaction([storeName], "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();

    if (Array.isArray(rawData)) {
        rawData.forEach((item, index) => {
            const record = Object.assign({}, item);
            if (!record[keyPath]) record[keyPath] = Date.now() + index;
            store.put(record);
        });
    } else if (rawData && typeof rawData === "object") {
        const record = Object.assign({ configKey: "global_settings" }, rawData);
        store.put(record);
    }
}

function getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) return resolve([]);
        const tx = dbInstance.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function hydrateAndSyncStores() {
    if (!localStorage.getItem("infocity_users")) {
        nativeSetItem.call(localStorage, "infocity_users", JSON.stringify(SEED_USERS));
    }
    // Ensure leases have the new Owner & Admin compliance fields
    const existingLeasesRaw = localStorage.getItem("infocity_leases");
    if (!existingLeasesRaw || !existingLeasesRaw.includes("lockInMonths")) {
        nativeSetItem.call(localStorage, "infocity_leases", JSON.stringify(SEED_LEASES));
        writeToObjectStore("leases", "id", SEED_LEASES);
    }
    if (!localStorage.getItem("infocity_compliance")) {
        nativeSetItem.call(localStorage, "infocity_compliance", JSON.stringify(SEED_COMPLIANCE));
        writeToObjectStore("building_compliance", "id", SEED_COMPLIANCE);
    }

    for (const [lsKey, meta] of Object.entries(STORE_MAP)) {
        const idbRecords = await getAllFromStore(meta.store);
        const localRaw = localStorage.getItem(lsKey);

        if (idbRecords.length > 0) {
            if (meta.store === "sys_config") {
                nativeSetItem.call(localStorage, lsKey, JSON.stringify(idbRecords[0]));
            } else {
                nativeSetItem.call(localStorage, lsKey, JSON.stringify(idbRecords));
            }
        } else if (localRaw) {
            try {
                writeToObjectStore(meta.store, meta.keyPath, JSON.parse(localRaw));
            } catch (e) {
                console.warn("Seed parse warning:", lsKey);
            }
        }
    }

    // Add newly introduced demo accounts without overwriting accounts created by HR.
    const currentUsers = JSON.parse(localStorage.getItem("infocity_users") || "[]");
    let usersChanged = false;
    SEED_USERS.forEach(seed => {
        if (!currentUsers.some(user => user.username === seed.username)) {
            currentUsers.push(seed);
            usersChanged = true;
        }
    });
    if (usersChanged) {
        nativeSetItem.call(localStorage, "infocity_users", JSON.stringify(currentUsers));
        writeToObjectStore("users", "username", currentUsers);
    }
}

Storage.prototype.setItem = function (key, value) {
    nativeSetItem.call(this, key, value);
    if (STORE_MAP[key] && dbInstance) {
        try {
            const parsed = JSON.parse(value);
            const { store, keyPath } = STORE_MAP[key];
            writeToObjectStore(store, keyPath, parsed);
            flashIDBActivity();
        } catch (err) {
            console.error("IndexedDB sync error:", err);
        }
    }
};

function renderIDBStatusBadge(connected) {
    if (document.getElementById("idb-status-pill")) return;
    const pill = document.createElement("div");
    pill.id = "idb-status-pill";
    pill.style.cssText = `
        position: fixed; bottom: 14px; right: 16px; z-index: 9999;
        background: #18242c; border: 1px solid ${connected ? '#15803d' : '#b91c1c'};
        color: #f8fafc; padding: 7px 14px; border-radius: 6px;
        font-size: 12px; font-family: Consolas, monospace;
        box-shadow: 0 4px 14px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px;
        transition: transform 0.2s ease;
    `;
    pill.innerHTML = `
        <span style="width:8px; height:8px; border-radius:50%; background:${connected ? '#22c55e' : '#ef4444'}; display:inline-block;"></span>
        <span>IndexedDB: ${connected ? 'GlobalInfoCity_DB v2 (LIVE)' : 'OFFLINE'}</span>
    `;
    document.body.appendChild(pill);
}

function flashIDBActivity() {
    const pill = document.getElementById("idb-status-pill");
    if (!pill) return;
    pill.style.transform = "scale(1.05)";
    setTimeout(() => { pill.style.transform = "scale(1)"; }, 220);
}

window.InfoCityDB = {
    calcRent: calcNetMonthlyRent,
    syncNow: hydrateAndSyncStores
};

initInfoCityIndexedDB();