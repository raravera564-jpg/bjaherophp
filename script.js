// --- APPLICATION LOCAL DATABASE DATA ---
const destinationData = {
    asia: [
        { code: "jp", name: "Japan", visa: "Visa Required", rate: "1 JPY ≈ 0.39 PHP", capital: "Tokyo" },
        { code: "th", name: "Thailand", visa: "Visa-Free for Filipinos", rate: "1 THB ≈ 1.72 PHP", capital: "Bangkok" },
        { code: "sg", name: "Singapore", visa: "Visa-Free for Filipinos", rate: "1 SGD ≈ 44.20 PHP", capital: "Singapore" }
    ],
    europe: [
        { code: "fr", name: "France", visa: "Schengen Visa Required", rate: "1 EUR ≈ 62.10 PHP", capital: "Paris" }
    ]
};

const profileChecklists = {
    private: [
        "Valid Passport (at least 6 months validity left)",
        "Confirmed Roundtrip Flight Tickets",
        "Approved Leave Form from Employer",
        "Company ID & Certificate of Employment (COE)",
        "Latest Payslips or ITR (Income Tax Return)",
        "Completed eTravel Registration QR Code"
    ],
    govt: [
        "Valid Passport & Roundtrip Tickets",
        "Official Signed Travel Authority (TA) from Agency Head",
        "Certificate of Leave Clearance",
        "Government Office ID / GSIS Card",
        "Completed eTravel Registration QR Code"
    ],
    sponsored: [
        "Valid Passport & Roundtrip Tickets",
        "PSA Birth or Marriage Certificate (To prove relationship)",
        "Notarized Affidavit of Support and Guarantee (AOSG)",
        "Sponsor's Passport copy & Visa/Work Permit copy",
        "Sponsor's Proof of Income / Bank Statement",
        "Completed eTravel Registration QR Code"
    ]
};

// --- CALCULATOR AND STATE CONFIGURATIONS ---
let currentStyleMultiplier = 1.0; // 1.0 = Budget, 1.5 = Mid-Range, 2.5 = Luxury
let currentTravelTax = 1620;

// --- DOM ELEMENTS ASSIGNMENT ---
const continentSelect = document.getElementById('continent');
const countrySelect = document.getElementById('country');
const countryMetaCard = document.getElementById('country-meta-card');
const countryTitle = document.getElementById('country-title');
const countryDetails = document.getElementById('country-details');

const checklistContainer = document.getElementById('checklist-container');
const progressPercent = document.getElementById('progress-percent');
const progressBar = document.getElementById('progress-bar');

const daysInput = document.getElementById('days');
const flightsInput = document.getElementById('flights');
const hotelInput = document.getElementById('hotel');
const pocketInput = document.getElementById('pocket');

// --- REPOSITORY CONTROLLER FUNCTIONS ---

// 1. Dynamic Dropdown Population Strategy
function handleContinentChange() {
    const selectedContinent = continentSelect.value;
    countrySelect.innerHTML = '<option value="">-- Choose a Destination --</option>';
    
    if (selectedContinent && destinationData[selectedContinent]) {
        destinationData[selectedContinent].forEach(country => {
            let option = document.createElement('option');
            option.value = country.code;
            option.dataset.continent = selectedContinent;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    }
    hideCountryMeta();
}

function handleCountryChange() {
    const selectedCountryCode = countrySelect.value;
    const selectedContinent = continentSelect.value;
    
    if (!selectedCountryCode) {
        hideCountryMeta();
        return;
    }

    const country = destinationData[selectedContinent].find(c => c.code === selectedCountryCode);
    if (country) {
        countryTitle.innerText = country.name;
        countryDetails.innerHTML = `
            <strong>Visa Rules:</strong> ${country.visa}<br>
            <strong>Exchange Rate:</strong> ${country.rate}<br>
            <strong>Capital:</strong> ${country.capital}
        `;
        countryMetaCard.style.display = "block";
    }
}

function hideCountryMeta() {
    countryMetaCard.style.display = "none";
}

// 2. Profile Switcher and Checklist Render Logic
function setProfile(profileKey, element) {
    // Styling Reset & Assign Active Class State
    document.querySelectorAll('.profile-grid .btn-option').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    // Build Checklist UI elements
    checklistContainer.innerHTML = '';
    const items = profileChecklists[profileKey] || [];
    
    items.forEach((task, index) => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <input type="checkbox" id="task-${index}" onchange="calculateProgress()">
            <label for="task-${index}" style="display:inline; margin:0; font-weight:normal;">${task}</label>
        `;
        checklistContainer.appendChild(div);
    });
    calculateProgress();
}

// 3. Document Readiness Progress Tracking
function calculateProgress() {
    const totalCheckboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = checklistContainer.querySelectorAll('input[type="checkbox"]:checked');
    
    let percentage = 0;
    if (totalCheckboxes.length > 0) {
        percentage = Math.round((checkedBoxes.length / totalCheckboxes.length) * 100);
    }
    
    progressPercent.innerText = percentage;
    progressBar.style.width = percentage + "%";
}

// 4. Budget Style Multipliers Control
function setTravelStyle(multiplier, element) {
    document.querySelectorAll('#style-options .btn-option').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    currentStyleMultiplier = multiplier;
    calculateGrandTotal();
}

// 5. Travel Tax Selector Engine
function setTravelTax(amount, element) {
    document.querySelectorAll('#tax-options .btn-option').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    currentTravelTax = amount;
    calculateGrandTotal();
}

// 6. Comprehensive Mathematical Processing Core
function calculateGrandTotal() {
    const days = parseInt(daysInput.value) || 0;
    const baseFlights = parseFloat(flightsInput.value) || 0;
    const baseHotel = parseFloat(hotelInput.value) || 0;
    const basePocket = parseFloat(pocketInput.value) || 0;

    // Apply scaling factor parameters relative to luxury selections
    const calculatedHotelTotal = (baseHotel * currentStyleMultiplier) * days;
    const calculatedPocketTotal = (basePocket * currentStyleMultiplier) * days;
    
    const finalBill = baseFlights + calculatedHotelTotal + calculatedPocketTotal + currentTravelTax;

    // Display formatted outputs in UI panel targets
    document.getElementById('total-flights-cost').innerText = "₱" + baseFlights.toLocaleString();
    document.getElementById('total-hotel-cost').innerText = "₱" + calculatedHotelTotal.toLocaleString();
    document.getElementById('total-pocket-cost').innerText = "₱" + calculatedPocketTotal.toLocaleString();
    document.getElementById('total-tax-cost').innerText = "₱" + currentTravelTax.toLocaleString();
    document.getElementById('grand-total-display').innerText = "₱" + finalBill.toLocaleString();

    // Dynamically scale safety baseline savings recommendations based on duration metrics
    const minSavingsRange = 30000 + (days * 3000);
    const maxSavingsRange = 45000 + (days * 4000);
    document.getElementById('savings-range').innerText = `₱${minSavingsRange.toLocaleString()} - ₱${maxSavingsRange.toLocaleString()}`;
}

// --- EVENT INITIALIZATIONS RUNTIME ---
document.addEventListener("DOMContentLoaded", () => {
    // Attach functional inputs events listeners
    [daysInput, flightsInput, hotelInput, pocketInput].forEach(elem => {
        elem.addEventListener('input', calculateGrandTotal);
    });

    // Fire default UI initial states
    handleContinentChange();
    const defaultProfileBtn = document.querySelector('.profile-grid .btn-option');
    if(defaultProfileBtn) setProfile('private', defaultProfileBtn);
    calculateGrandTotal();
});