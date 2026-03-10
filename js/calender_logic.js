const heute = new Date();
const wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const monate = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
];

let aktuellesJahr = heute.getFullYear();
let aktuellerMonatIndex = heute.getMonth();
let aktuellerTag = heute.getDate();

let selectedJahr = heute.getFullYear();
let selectedMonatIndex = heute.getMonth();
let selectedTag = heute.getDate();

// Feiertags-Prüfung 
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

function updateInfoText() {
    const d = new Date(selectedJahr, selectedMonatIndex, selectedTag);
    const mName = monate[selectedMonatIndex];
    const wName = wochentage[d.getDay()];
    const wWochentag = Math.ceil(selectedTag / 7);

    // Berechne den Tag des Jahres
    const start = new Date(selectedJahr, 0, 0);
    const diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const einerTag = 1000 * 60 * 60 * 24;
    const tagDesJahres = Math.floor(diff / einerTag);

    const fName = getFeiertagName(selectedTag, selectedMonatIndex, selectedJahr);
    const fText = fName ? "ein" : "kein";

    document.title = `Kalender - ${selectedTag}. ${mName} ${selectedJahr}`;

    const ptElement = document.getElementById("page-title");
    if (ptElement) {
        ptElement.innerText = `JS-Kalender: ${selectedTag}. ${mName} ${selectedJahr}`;
    }

    const itElement = document.getElementById("info-text");
    if (itElement) {
        itElement.innerText = `Der ${selectedTag}. ${mName} ${selectedJahr} ist ein ${wName} und der ${wWochentag}. ${wName} ` +
            `im Monat ${mName} des Jahres ${selectedJahr}. Außerdem ist es der ${tagDesJahres}. Tag des Jahres ${selectedJahr}. ` +
            (selectedTag === heute.getDate() && selectedMonatIndex === heute.getMonth() && selectedJahr === heute.getFullYear() ? "Heute" : `Dieser Tag`) +
            ` ist ${fText} gesetzlicher Feiertag.`;
    }
}

// Initialer Aufruf
updateInfoText();

// TERMINE (LocalStorage)
// Wir laden Termine aus dem LocalStorage 
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
        if (tag === selectedTag && aktuellerMonatIndex === selectedMonatIndex && aktuellesJahr === selectedJahr) {
            klassen += " selected";
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

        // Klick-Event: Tag auswählen
        tagDiv.addEventListener('click', () => {
            selectedTag = tag;
            selectedMonatIndex = aktuellerMonatIndex;
            selectedJahr = aktuellesJahr;

            updateInfoText();
            listHistoricalEvents();
            renderCalendar(); // UI aktualisieren (selected Klasse setzen)
        });

        // Doppelklick-Event: Neuen Termin anlegen
        tagDiv.addEventListener('dblclick', () => {
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

// HISTORISCHE EREIGNISSE (Wikipedia API)
async function listHistoricalEvents() {
    const eventsList = document.getElementById("historical-events-list");
    if (!eventsList) return;

    const monatsNameLink = monate[selectedMonatIndex];
    const wikipediaTitel = `${selectedTag}._${monatsNameLink}`;

    eventsList.innerHTML = "<li>Lade historische Ereignisse von Wikipedia...</li>";

    try {

        const response = await fetch(`https://de.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(wikipediaTitel)}&prop=text&origin=*`);

        if (!response.ok) {
            throw new Error(`Fehler beim Abruf der Wikipedia API: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Wikipedia API Fehler: ${data.error.info}`);
        }

        const htmlString = data.parse.text['*'];


        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");


        const ereignisseHeadline = doc.getElementById("Ereignisse");
        if (!ereignisseHeadline) {
            throw new Error("Bereich 'Ereignisse' nicht gefunden auf der Wikipedia-Seite.");
        }

        let currentElement = ereignisseHeadline.parentElement;
        const alleEreignisse = [];


        while (currentElement && currentElement.nextElementSibling) {
            currentElement = currentElement.nextElementSibling;

            if (currentElement.tagName === "H2") {
                break;
            }

            if (currentElement.tagName === "UL") {
                const listItems = currentElement.querySelectorAll("li");
                listItems.forEach(li => {
                    let text = li.innerText.replace(/\[\d+\]/g, '').trim();
                    if (text.length > 5) {
                        alleEreignisse.push(text);
                    }
                });
            }
        }

        if (alleEreignisse.length === 0) {
            throw new Error("Keine Ereignis-Einträge gefunden.");
        }

        const randomEvents = [];
        const eventsCopy = [...alleEreignisse];
        const anzahlZuZeigen = Math.min(5, eventsCopy.length);

        for (let i = 0; i < anzahlZuZeigen; i++) {
            const randomIndex = Math.floor(Math.random() * eventsCopy.length);
            randomEvents.push(eventsCopy.splice(randomIndex, 1)[0]);
        }

        eventsList.innerHTML = "";
        randomEvents.forEach(ereignisText => {
            const li = document.createElement("li");


            let trennungsIndex = ereignisText.indexOf(':');

            if (trennungsIndex !== -1 && trennungsIndex < 15) {
                const jahr = ereignisText.substring(0, trennungsIndex);
                const restText = ereignisText.substring(trennungsIndex + 1).trim();
                li.innerHTML = `<strong>${jahr}:</strong> ${restText}`;
            } else {
                li.innerHTML = ereignisText;
            }

            eventsList.appendChild(li);
        });

    } catch (error) {
        console.error("Fehler beim Scraping der Wikipedia-Ereignisse:", error);
        eventsList.innerHTML = `<li class="error">Die historischen Ereignisse der deutschsprachigen Wikipedia konnten leider nicht geladen werden.</li>`;
    }
}

listHistoricalEvents();
