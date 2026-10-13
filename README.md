# Skorica landing

Javna marketinška stranica za Skoricu.

- produkcijska domena: `https://skorica.com`
- aplikacija: `https://app.skorica.com`
- prijava: `https://app.skorica.com/login`
- registracija: `https://app.skorica.com/register`

Landing je namjerno odvojen od repozitorija `skorica-app`.

Kontakt je Promar, agencija za promidžbu, info@promar.hr. Pristup aplikaciji
dogovara se osobno, uz pozivnicu i ručnu aktivaciju.

Informacijske poveznice u footeru otvaraju native dialog na vrhu ekrana i
svaki put vraćaju tekst na početak. Pozadina se zamagli i zaključava;
zatvaranje vraća fokus. Kopiranje je ograničeno standardnim browser
događajima i CSS-om, a izvorni sadržaj i snimke nisu zaštićeni od pristupa.
Četiri HTML stranice ostaju dostupne i bez JavaScripta.

Tekstovi su statički preuzeti iz kanonskih komponenti `skorica-app`; izvorni
commit je u `docs/information-source.json`. Za osvježenje, iz ove mape:
`node scripts/sync-information.mjs /apsolutni/put/skorica-app PUNI_COMMIT_SHA`.
Generator koristi postojeće development ovisnosti aplikacije. Landing nema
nove runtime ovisnosti niti poveznicu koja učitava osobne podatke.

`npm ci`, `npx playwright install chromium`, `npm test` provjeravaju modal,
kontakt, povratak na početak i širinu 320px na desktopu i mobitelu.
