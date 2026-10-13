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

Kanonski tekstovi nalaze se u četiri samostalna HTML dokumenta ovog repozitorija. Nakon njihove izmjene pokrenite `node scripts/sync-information.mjs` za usklađenje modalnih kopija u index.html. Povijest izvornog preuzimanja ostaje u docs/information-source.json. Generator više ne ovisi o skorica-app repozitoriju ni njegovim bibliotekama. Landing nema nove runtime ovisnosti.

`npm ci`, `npx playwright install chromium`, `npm test` provjeravaju modal,
kontakt, povratak na početak i širinu 320px na desktopu i mobitelu.
