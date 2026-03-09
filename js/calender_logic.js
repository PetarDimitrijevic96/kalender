const heute = new Date();
const wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
];

let aktuellesJahr = heute.getFullYear();
let aktuellerMonatIndex = heute.getMonth();
let aktuellerTag = heute.getDate();
const aktuellerWochentagIndex = heute.getDay();

const monatsName = monate[aktuellerMonatIndex];
const wochentagName = wochentage[aktuellerWochentagIndex];
const wievielterWochentag = Math.ceil(aktuellerTag / 7);

// Feiertags-Prüfung (inkl. flexibler Feiertage)
function getFeiertagName(tag, monat, jahr) {
    const festeFeiertage = {
        "1.0": "Neujahr",
        "1.4": "Tag der Arbeit",
        "3.9": "Tag der Dt. Einheit",
        "31.9": "Reformationstag",
        "1.10": "Allerheiligen",
        "25.11": "1. Weihnachtstag",
        "26.11": "2. Weihnachtstag"
    };

    const key = tag + "." + monat;
    if (festeFeiertage[key]) {
        return festeFeiertage[key];
    }

    // Gaußsche Osterformel
    const a = jahr % 19;
    const b = jahr % 4;
    const c = jahr % 7;
    const k = Math.floor(jahr / 100);
    const p = Math.floor((13 + 8 * k) / 25);
    const q = Math.floor(k / 4);
    const m = (15 - p + k - q) % 30;
    const n = (4 + k - q) % 7;
    const d = (19 * a + m) % 30;
    const e = (2 * b + 4 * c + 6 * d + n) % 7;

    let osternTag = 22 + d + e;
    let osternMonat = 2;

    if (osternTag > 31) {
        osternTag = d + e - 9;
        osternMonat = 3;
    }
    if (osternTag === 26 && osternMonat === 3) {
        osternTag = 19;
    }
    if (osternTag === 25 && osternMonat === 3 && d === 28 && e === 6 && a > 10) {
        osternTag = 18;
    }

    const ostersonntag = new Date(jahr, osternMonat, osternTag);
    const checkDate = new Date(jahr, monat, tag);
    const diffTage = Math.round((checkDate - ostersonntag) / (1000 * 60 * 60 * 24));

    switch (diffTage) {
        case -2: return "Karfreitag";
        case 0: return "Ostersonntag";
        case 1: return "Ostermontag";
        case 39: return "Christi Himmelfahrt";
        case 49: return "Pfingstsonntag";
        case 50: return "Pfingstmontag";
        case 60: return "Fronleichnam";
    }

    return null;
}

const heuteFeiertagName = getFeiertagName(aktuellerTag, aktuellerMonatIndex, aktuellesJahr);
const feiertagText = heuteFeiertagName ? "ein" : "kein";

document.title = `Kalender - ${aktuellerTag}. ${monatsName} ${aktuellesJahr}`;

const pageTitleElement = document.getElementById("page-title");
if (pageTitleElement) {
    pageTitleElement.innerText = `JS-Kalender: ${aktuellerTag}. ${monatsName} ${aktuellesJahr}`;
}

const infoTextElement = document.getElementById("info-text");
if (infoTextElement) {
    infoTextElement.innerText = `Der ${aktuellerTag}. ${monatsName} ${aktuellesJahr} ist ein ${wochentagName} und der ${wievielterWochentag}. ${wochentagName} \n` +
        `im Monat ${monatsName} des Jahres ${aktuellesJahr}. Heute ist ${feiertagText} gesetzlicher Feiertag.`;
}

// Diese statische Zuweisung wurde in renderCalendar() verschoben, damit sie sich aktualisiert.

// TERMINE (LocalStorage)
// Wir laden Termine aus dem LocalStorage oder starten mit einem leeren Objekt
let termine = JSON.parse(localStorage.getItem('termine')) || {};

function saveTermin(datumKey, text) {
    if (!termine[datumKey]) {
        termine[datumKey] = [];
    }
    termine[datumKey].push(text);
    localStorage.setItem('termine', JSON.stringify(termine));
    renderCalendar();
}

// KALENDERBLATT GENERIEREN 
const calendarGrid = document.getElementById('calendar-grid');

function renderCalendar() {
    if (!calendarGrid) return;

    // Überschrift aktualisieren
    const calendarHeaderElement = document.getElementById("calendar-header-title");
    if (calendarHeaderElement) {
        calendarHeaderElement.innerText = `${monate[aktuellerMonatIndex]} ${aktuellesJahr}`;
    }

    // Alte Tage entfernen, außer die Wochentags-Header (die ersten 7 div-Elemente)
    const allDays = calendarGrid.querySelectorAll('.calendar-day');
    allDays.forEach(day => day.remove());

    const ersterTagDesMonats = new Date(aktuellesJahr, aktuellerMonatIndex, 1);
    let startWochentagIndex = ersterTagDesMonats.getDay();
    let leereFelderAmAnfang = startWochentagIndex === 0 ? 6 : startWochentagIndex - 1;

    const letzterTagDesMonats = new Date(aktuellesJahr, aktuellerMonatIndex + 1, 0);
    const anzahlTageImMonat = letzterTagDesMonats.getDate();

    // 1. Leere Felder am Anfang
    for (let i = 0; i < leereFelderAmAnfang; i++) {
        let emptyDiv = document.createElement("div");
        emptyDiv.className = "calendar-day empty";
        calendarGrid.appendChild(emptyDiv);
    }

    // 2. Aktuelle Tage generieren
    for (let tag = 1; tag <= anzahlTageImMonat; tag++) {
        let tagDiv = document.createElement("div");
        let klassen = "calendar-day";

        if (tag === heute.getDate() && aktuellerMonatIndex === heute.getMonth() && aktuellesJahr === heute.getFullYear()) {
            klassen += " today";
        }
        const feiertagName = getFeiertagName(tag, aktuellerMonatIndex, aktuellesJahr);
        if (feiertagName) {
            klassen += " holiday";
        }

        tagDiv.className = klassen;
        tagDiv.innerHTML = `<span class="day-number">${tag}</span>`;
        if (feiertagName) {
            tagDiv.innerHTML += `<span class="holiday-name">${feiertagName}</span>`;
        }

        let datumKey = `${aktuellesJahr}-${aktuellerMonatIndex}-${tag}`;

        // Termine für diesen Tag anzeigen
        if (termine[datumKey] && termine[datumKey].length > 0) {
            let termineList = document.createElement("ul");
            termineList.className = "termine-list";
            termine[datumKey].forEach(t => {
                let li = document.createElement("li");
                li.innerText = t;
                termineList.appendChild(li);
            });
            tagDiv.appendChild(termineList);
        }

        // Klick-Event für neuen Termin
        tagDiv.addEventListener('click', () => {
            let terminText = prompt(`Neuen Termin für den ${tag}. ${monate[aktuellerMonatIndex]} eingeben:`);
            if (terminText && terminText.trim() !== '') {
                saveTermin(datumKey, terminText.trim());
            }
        });

        calendarGrid.appendChild(tagDiv);
    }

    // 3. Restliche leere Felder am Ende auffüllen (damit das Grid komplett ist)
    const gesamtGezeichneteFelder = leereFelderAmAnfang + anzahlTageImMonat;
    const restlicheFelder = 7 - (gesamtGezeichneteFelder % 7);
    if (restlicheFelder < 7) {
        for (let i = 0; i < restlicheFelder; i++) {
            let emptyDiv = document.createElement("div");
            emptyDiv.className = "calendar-day empty";
            calendarGrid.appendChild(emptyDiv);
        }
    }
}

// === NAVIGATION ===
document.getElementById('prev-year')?.addEventListener('click', () => {
    aktuellesJahr--;
    renderCalendar();
});

document.getElementById('next-year')?.addEventListener('click', () => {
    aktuellesJahr++;
    renderCalendar();
});

document.getElementById('prev-month')?.addEventListener('click', () => {
    aktuellerMonatIndex--;
    if (aktuellerMonatIndex < 0) {
        aktuellerMonatIndex = 11;
        aktuellesJahr--;
    }
    renderCalendar();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    aktuellerMonatIndex++;
    if (aktuellerMonatIndex > 11) {
        aktuellerMonatIndex = 0;
        aktuellesJahr++;
    }
    renderCalendar();
});

renderCalendar();
