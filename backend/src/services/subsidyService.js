import axios from 'axios';
import Papa from 'papaparse';

let subsidiesCache = [
    {
        programId: "STR",
        name: "Sumbangan Tunai Rahmah (STR)",
        benefitText: "Up to RM 3,700/year",
        incomeMaxMonthly: 5000,
        householdMin: 0,
        link: "https://bantuantunai.hasil.gov.my/",
        category: "Cash Aid"
    },
    {
        programId: "eBelia",
        name: "e-Tunai Belia Rahmah",
        benefitText: "RM 200 one-off e-wallet credit",
        ageMin: 18,
        ageMax: 20,
        requiresStudent: true,
        link: "https://budget.mof.gov.my/manfaat/",
        category: "Youth"
    },
    {
        programId: "SARA",
        name: "Sumbangan Asas Rahmah (SARA)",
        benefitText: "RM 100/month for groceries",
        incomeMaxMonthly: 2500,
        category: "Groceries"
    },
    {
        programId: "MySalam",
        name: "mySalam Takaful Protection",
        benefitText: "Free health protection & RM8k payout",
        incomeMaxMonthly: 8000,
        ageMin: 18,
        ageMax: 65,
        category: "Health"
    },
    {
        programId: "PTPTN-Discount",
        name: "PTPTN Repayment Discount",
        benefitText: "10-15% discount on repayment",
        link: "https://www.ptptn.gov.my/",
        category: "Education",
        requiresStudent: false
    }
];

export async function refreshSubsidies() {
    if (!process.env.GOOGLE_SHEET_CSV_URL) {
        console.log("No GOOGLE_SHEET_CSV_URL provided, using defaults.");
        return;
    }
    try {
        console.log("Fetching subsidies from Sheet...");
        const response = await axios.get(process.env.GOOGLE_SHEET_CSV_URL);

        Papa.parse(response.data, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data.map(row => ({
                    programId: row.programId?.trim(),
                    name: row.name?.trim(),
                    benefitText: row.benefitText?.trim(),
                    incomeMaxMonthly: row.incomeMaxMonthly ? Number(row.incomeMaxMonthly) : undefined,
                    ageMin: row.ageMin ? Number(row.ageMin) : undefined,
                    ageMax: row.ageMax ? Number(row.ageMax) : undefined,
                    category: row.category?.trim(),
                    link: row.link?.trim(),
                    requiresStudent: row.requiresStudent?.toLowerCase() === 'true',
                    householdMin: row.householdMin ? Number(row.householdMin) : undefined
                })).filter(p => p.programId && p.name);

                if (parsed.length > 0) {
                    subsidiesCache = parsed;
                    console.log(`Updated subsidies cache with ${parsed.length} programs.`);
                }
            },
            error: (err) => {
                console.error("CSV Parse Error:", err.message);
            }
        });
    } catch (error) {
        console.error("Failed to fetch subsidies sheet:", error.message);
    }
}

// Refresh on load (async, doesn't block startup)
refreshSubsidies();
const REFRESH_INTERVAL = 1000 * 60 * 60; // 1 hour
setInterval(refreshSubsidies, REFRESH_INTERVAL);

export const subsidies = subsidiesCache;

export function matchSubsidies(profile) {
    const matches = [];
    const notEligible = [];

    const income = profile.incomeMonthly || 0;
    const age = profile.age || 0;
    const isStudent = profile.employmentStatus === 'student';
    const householdSize = profile.householdSize || 1;

    subsidiesCache.forEach(program => {
        const reasons = [];
        const missingFields = [];
        let isEligible = true;

        // Income Check
        if (program.incomeMaxMonthly !== undefined) {
            if (income > program.incomeMaxMonthly) {
                isEligible = false;
                reasons.push(`Income RM${income} exceeds limit RM${program.incomeMaxMonthly}`);
            }
        }

        // Age Check
        if (program.ageMin !== undefined && age < program.ageMin) {
            isEligible = false;
            reasons.push(`Age ${age} below minimum ${program.ageMin}`);
        }
        if (program.ageMax !== undefined && age > program.ageMax) {
            isEligible = false;
            reasons.push(`Age ${age} exceeds maximum ${program.ageMax}`);
        }

        // Employment/Student Check
        if (program.requiresStudent && !isStudent) {
            // If status unknown, it's a missing field, else ineligible
            if (!profile.employmentStatus) {
                missingFields.push('employmentStatus');
                // tentative fail until known
                isEligible = false;
            } else {
                isEligible = false;
                reasons.push("Requires student status");
            }
        }

        // Household Check
        if (program.householdMin !== undefined && householdSize < program.householdMin) {
            isEligible = false;
            reasons.push(`Household size ${householdSize} below minimum ${program.householdMin}`);
        }

        if (isEligible) {
            matches.push({
                ...program,
                eligible: true,
                matchConfidence: 1.0,
                reasons: ["Meets all criteria"]
            });
        } else {
            notEligible.push({
                ...program,
                eligible: false,
                matchConfidence: 0.0,
                reasons,
                missingFields
            });
        }
    });

    return { matches, notEligible };
}
