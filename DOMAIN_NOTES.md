# Bilješke o pravnom okviru (pročitano prije kodiranja)

Datum provjere izvora: 2026-10-01.

## Izvori pročitani
- NN 112/14, Pravilnik o izradi procjene rizika (izvorni tekst) — narodne-novine.nn.hr i zakon.hr
- NN 129/19, Pravilnik o izmjenama i dopunama Pravilnika o izradi procjene rizika — narodne-novine.nn.hr
- Zakon o zaštiti na radu — pročišćeni tekst (NN 71/14, 118/14, 94/18, 96/18), pregled preko zakon.hr/informator.hr
- Pravilnik o poslovima s posebnim uvjetima rada — pregled preko informator.hr/zakon.hr

Napomena: izvori su dohvaćeni putem web-fetch alata (sažetci/izvodi stranice), ne izravnim čitanjem PDF-a s Narodnih novina. Smatram tekst Pravilnika o izradi procjene rizika (postupak, Prilog I matrica, Prilog III klasifikacija, čl. 11 prilozi) pouzdano potvrđenim jer je dohvaćen doslovno u dva neovisna poziva koja se podudaraju s mojim početnim sažetkom. Za Zakon o ZNR i Pravilnik o poslovima s posebnim uvjetima rada dohvaćeni su samo sažeci, pa su ti dijelovi u alatu označeni kao "provjeriti".

## Što je 2019. (NN 129/19) promijenjeno
Izmjene NE diraju Prilog I (matricu) niti Prilog III (klasifikaciju opasnosti/štetnosti/napora) — to je potvrđeno eksplicitnom provjerom teksta izmjena. Promjene su:
1. čl. 1 Pravilnika — dodan stavak 4: poslodavac ne mora dokumentirati procjenu rizika za povremeni rad na izdvojenom mjestu rada ako je riječ o poslovima koji su već ocijenjeni kao mali rizik (uredski/administrativni i sl.) i koje radnik inače obavlja u prostoru poslodavca.
2. čl. 5 Pravilnika — dodan stavak 2: dopušta se korištenje interaktivnog online alata za procjenu rizika (OiRA) kad ga osigura nadležno tijelo/ministarstvo.
3. čl. 8 st. 3 Pravilnika — izmijenjen: iznimka da se pojedini poslovi iz Priloga II (inače "mali rizik" primjeri) ipak mogu/moraju drugačije razvrstati ako postoji specifična opasnost na tom mjestu rada.
4. čl. 10 st. 2 Pravilnika — brisan.
5. čl. 12 Pravilnika — izmijenjen/dopunjen: eksplicitno propisano sudjelovanje radnika (i njihovog predstavnika za ZNR) uz ovlaštenika i stručnjaka ZNR u izradi procjene; dodane obveze periodičkog preispitivanja mjera uz pokazatelje (ozljede, pritužbe radnika, odluke odbora ZNR i sl.).

Zaključak: moja (korisnikova) polazna klasifikacija iz zadatka ostaje TOČNA i nakon 2019. izmjena — nije zastarjela u dijelu matrice i Priloga III. U alat su ugrađeni **stvarni** podaci za: 4 faze postupka, Prilog I matricu (9 kombinacija) i puni Prilog III popis (s podkategorijama, vidi niže).

## Prilog I — matrica procjene rizika (potvrđeno, ugrađeno u kod)
Vjerojatnost (redci) × Posljedica (stupci) → razina rizika:

| | Malo štetno | Srednje štetno | Izrazito štetno |
|---|---|---|---|
| **Malo vjerojatno** | mali | mali | srednji |
| **Vjerojatno** | mali | srednji | veliki |
| **Vrlo vjerojatno** | srednji | veliki | veliki |

## Prilog III — puna klasifikacija (potvrđeno, ugrađeno u kod kao stablo za odabir)
Struktura I. OPASNOSTI / II. ŠTETNOSTI / III. NAPORI s punim podkategorijama ugrađena je u `src/data/prilogIII.ts`. Sažetak glavnih skupina:

**I. OPASNOSTI**: 1. Mehaničke (alati ručni/mehanizirani; strojevi i oprema; sredstva za horizontalni prijenos; sredstva za vertikalni prijenos; rukovanje predmetima; ostalo), 2. Padovi (na istoj razini, u dubinu, s visine, s visine iznad 3 m; pad predmeta), 3. Električna struja, 4. Požar i eksplozija, 5. Termičke opasnosti.

**II. ŠTETNOSTI**: 1. Kemijske (otrovi, korozivi, nadražljivci, zagušljivci, senzibilizatori, fibrogeni, mutageni, karcinogeni, teratogeni — svaka s punim podkategorijama), 2. Biološke, 3. Fizikalne (buka, vibracije, promijenjeni tlak, klimatski/mikroklimatski uvjeti, ionizirajuće zračenje, neionizirajuće zračenje, osvijetljenost, ostalo).

**III. NAPORI**: 1. Statodinamički (statički i dinamički, s punim podkategorijama), 2. Psihofiziološki (ritam rada, bioritam, socijalne potrebe, odgovornost, izvanredni događaji, prijam informacija, radni zahtjevi, maltretiranje/mobing, burnout, ostalo), 3. Napori vida, 4. Napori govora.

## Čl. 11 — obvezni prilozi procjeni rizika (potvrđeno, doslovno)
1. sigurnosni podaci izvora fizikalnih štetnosti, kemikalija odnosno bioloških agensa,
2. popis radne opreme,
3. popis osobne zaštitne opreme (za poslove gdje se mora koristiti),
4. popis potrebnih ispitivanja,
5. popis poslova s posebnim uvjetima rada.

## 4 faze postupka (potvrđeno)
1. Prikupljanje podataka na mjestu rada.
2. Analiza i procjena (opasnosti/štetnosti/napori, procjena razine, utvrđivanje mjera).
3. Plan mjera (rokovi, ovlaštenici, kontrola provedbe).
4. Dokumentiranje procjene rizika.

## Prilog II (primjeri poslova s malim rizikom)
Postoji i primjenjuje se (uredski/administrativni poslovi, trgovina bez skladištenja, programiranje, financije, savjetovanje i sl.), uz napomenu iz NN 129/19 (čl. 8 st. 3) da se pojedini poslovi s tog popisa ipak mogu razvrstati u višu razinu ako na konkretnom mjestu rada postoji specifična opasnost. U alatu se ne koristi kao automatska klasifikacija — stručnjak uvijek sam bira vjerojatnost/posljedicu; ovo je samo kontekstualna napomena.

## Što NIJE pouzdano potvrđeno i je u alatu označeno "provjeriti prije korištenja"
- **Točan raspored OZO (osobne zaštitne opreme) po pojedinim rizicima** — Pravilnik o izradi procjene rizika ne propisuje točan katalog "rizik → OZO"; to je stručna odluka utemeljena na specifičnim propisima o OZO i procjeni. U alatu su to uredive, prazne/predložene stavke.
- **Točne točke/vrste liječničkog pregleda po riziku** — ovise o Pravilniku o poslovima s posebnim uvjetima rada i posebnim propisima (npr. za buku, vibracije, kemijske štetnosti), koji nisu detaljno dohvaćeni. Polje je uredivo, bez unaprijed upisanih vrijednosti, s napomenom.
- **Pravilnik o poslovima s posebnim uvjetima rada** — temeljni tekst je NN 5/84 (1984.). I dalje je važeći propis (potvrđeno naknadno kroz službeni primjer "Risko", vidi odjeljak niže), ali bez novijeg pročišćenog teksta koji bih mogao pouzdano citirati, pa točan sadržaj pojedinih točaka čl. 3 (koji konkretni uvjeti/poslovi) nije ugrađen kao gotov katalog. Popis poslova s posebnim uvjetima rada i broj točke čl. 3 po riziku u alatu su zato uredivo polje koje stručnjak sam popunjava, ne unaprijed popunjen katalog.
- **Rokovi i vrste ispitivanja radne opreme/radnog okoliša** — nisu detaljno dohvaćeni iz Pravilnika o ispitivanju radnog okoliša i radne opreme; polje je uredivo.
- **Zakon o zaštiti na radu, pročišćeni tekst** — dohvaćen samo sažetak (NN 71/14, 118/14, 94/18, 96/18 kao sastavnice). Korišten je samo za opći kontekst (obveze poslodavca, sudjelovanje radnika/odbora ZNR), ne za konkretne brojčane/postupovne detalje u alatu.

## Dodatna provjera: službeni primjer "Risko" (Ministarstvo rada, 2022.)
Datum provjere: 2026-10-01. Pročitan cijeli dokument (40 str., pretvoren u tekst s `pdftotext -layout`) s https://uznr.mrms.hr/wp-content/uploads/2022/03/risko/risko_primjer.pdf — službeni metodološki model i popunjeni primjer procjene rizika Ministarstva rada. Korišten je isključivo za **organizaciju podataka** (koje stupce/polja službeni obrazac koristi), ne za preuzimanje teksta — nijedna rečenica iz primjera nije kopirana u alat.

Potvrđeno/ispravljeno ovom provjerom:
- **Matrica (Prilog I) i Prilog III popis u primjeru su identični onome već ugrađenom u alat** (isti brojevi, iste oznake kategorija O./S./N.). Nema potrebe za izmjenom.
- **Pravilnik o poslovima s posebnim uvjetima rada (NN 5/84) NIJE označen kao zastario ili prevladan u službenom primjeru** — naprotiv, dokument iz 2022. ga navodi kao važeći propis i koristi njegove brojčane "točke čl. 3" (npr. "1,2,18") kao standardnu referencu u tablici procjene po poslu i u prilogu E.2/E.3. Ranija napomena u ovom dokumentu da je propis "vrlo star" i time implicitno upitan je uklonjena — ispravnije je reći da je i dalje važeći, ali da alat ne zna točan sadržaj svake pojedine točke čl. 3 (koji poslovi/uvjeti), pa to polje ostaje slobodni unos broja točke uz oznaku "provjeriti".
- **Tablica procjene po poslu (B.1.2 u primjeru)** ima stupce: Opasnost/Štetnost/Napor, **Mogući neželjeni događaj** (slobodan tekst), Vjerojatnost, Posljedica, Rizik (izračunat), Mjere za uklanjanje/smanjivanje, Obavezna zaštitna oprema, **Točka PUR-a** (čl. 3 Pravilnika NN 5/84, ako je primjenjivo). Dodana su u alat kao nova uredive polja po riziku: "Mogući neželjeni događaj" i "Točka Pravilnika".
- **Prilog "Popis radne opreme" (E.5)** ima stupce "Period pregleda (mjeseci)" i "Datum posljednjeg pregleda" — dodano u alat.
- **Prilog "Popis OZO" (E.6)** uz svaku stavku OZO navodi **normu (HRN)** — dodano u alat kao zasebno uredivo polje uz prijedlog OZO, s katalogom uobičajenih HRN EN normi (opće poznate, javne oznake normi; točna primjenjivost uvijek "provjeriti").
- **Prilog "Popis potrebnih ispitivanja" (E.7)** ima "Period ispitivanja (mjeseci)" i "Datum posljednjeg ispita" — dodano.
- **Prilog "Raspored poslova i mjesta rada po radnim mjestima" (E.1)** — tablica radno mjesto → posao (jedan redak po kombinaciji). Alat je već prikupljao te podatke (koraci 2-3); dodan je kao zaseban automatski prilog.
- **Prilog "Popis poslova izloženih naporu vida i/ili govora" (E.8)** — u alatu se automatski izvodi iz postojećih odabira rizika kategorije "Napori vida" (3) / "Napori govora" (4) u Prilogu III, bez novih polja.
- **Ergonomija rada na računalu (E.9/E.9.1)** — službeni primjer sadrži vrlo dugu, doslovno propisanu kontrolnu listu (zaslon, tipkovnica, stol, stolac, radni okoliš - desetci stavki iz posebnog pravilnika). Ta se pravna kontrolna lista **ne prenosi doslovno** (ne kopiramo tekst propisa) - umjesto toga alat nudi kraći, vlastito sročen checklist po istim kategorijama (zaslon / tipkovnica i miš / radni stol / radni stolac / radni okoliš) sa statusom "zadovoljava: da/ne/nije primjenjivo" i uredivom napomenom, vidljiv za poslove koji su označeni da uključuju rad na računalu 4+ sati dnevno. Puni pravni tekst zahtjeva treba provjeriti u izvornom propisu (Pravilnik o zaštiti na radu radnika izloženih statodinamičkim, psihofiziološkim i drugim naporima na radu, NN 73/2021 — naslov potvrđen iz primjera, sadržaj članaka nije dohvaćen pa nije ugrađen kao gotov tekst).
- **Plan mjera** u primjeru ima i stupac "periodika" (koliko se često mjera/kontrola ponavlja) — dodano kao uredivo polje uz mjeru/rok/odgovornu osobu/kontrolu.
- **Procjena psihosocijalnih rizika (F.5/F.6)** — službeni primjer koristi standardizirani upitnik od 35 pitanja u 7 kategorija (zahtjevi rada, međuljudski odnosi, kontrola u radu, podrška nadređenog, podrška kolega, radna uloga, neupućenost u promjene) + zasebnu skalu nesigurnosti posla. Prosječan rezultat po pitanjima mapira se u vjerojatnost: **prosjek < 3 → malo vjerojatno, 3-4 → vjerojatno, ≥ 4 → vrlo vjerojatno** (ovaj prag je potvrđen doslovno iz dokumenta i ugrađen u izračun). Sama pitanja NISU prenesena (ne kopiramo tekst upitnika) — alat nudi kraći, samostalno sročen upitnik od 7 pitanja (po jedno reprezentativno pitanje za svaku od istih 7 tematskih kategorija kao orijentir, ne doslovni prijevod/kopija), isti princip bodovanja 1-5 i isti prag za izračun vjerojatnosti. Rezultat je uvijek samo prijedlog koji se upisuje u polje vjerojatnosti i koji stručnjak može slobodno promijeniti (nadjačati).

## Zaključak za dizajn alata
Alat ugrađuje kao **činjenice** (potvrđeno izvorom): 4 faze postupka, Prilog I matricu, puni Prilog III popis, čl. 11 popis obveznih priloga. Sve ostalo vezano za OZO, liječničke preglede i poslove s posebnim uvjetima rada je **uredivi prijedlog** vidno označen "provjeriti prije korištenja", bez unaprijed upisanih gotovih vrijednosti koje bi se mogle pogrešno shvatiti kao propisane. Stručnjak uvijek sam bira vjerojatnost i posljedicu za svaki rizik — alat samo izračunava razinu po matrici; nema AI-generiranih zaključaka o rizicima.

## Dodatna provjera: potpuno popunjavanje demo-primjera (2026-10-01)
Cilj ovog kruga izmjena bio je da demo-primjer "Primjer d.o.o." izgleda kao interno dosljedna, potpuno popunjena procjena (nijedno "(nije uneseno)" polje tamo gdje stručnjak stvarno treba odlučiti), umjesto da ostane namjerno prazan da pokaže samo strukturu. Sve dodane konkretne vrijednosti u primjeru (OZO, norme, točke Pravilnika, rokovi pregleda, tekstovi "mogućeg neželjenog događaja") i dalje su **izmišljene ilustracije**, ne stvarna stručna procjena niti doslovno preuzet sadržaj propisa — razlika je samo u tome da su sada popunjene umjesto prazne, uz vidljivu oznaku "provjeriti" gdje je to pravno neizvjesno.

- **Ukupan broj radnika** više se ne unosi ručno na zaslonu "Poslodavac" — polje je sada izračunato (zbroj po radnim mjestima, korak 2) i prikazano kao samo za čitanje, da se spriječi buduće razilaženje zbroja.
- **Norme OZO koje nisu na ugrađenom popisu** (npr. HRN EN 407 za toplinski otporne rukavice, HRN EN ISO 374-1 za rukavice za kemikalije) nisu izmišljene kao da su na popisu — tamo gdje postoji bliska stavka na popisu (npr. HRN EN ISO 11612 "zaštita od topline i plamena") ta je iskorištena uz obrazloženje u tekstu polja; gdje odgovarajuće norme uopće nema na popisu, polje eksplicitno piše da norma nije na ugrađenom popisu i da je treba provjeriti, umjesto da se tiho izmisli oznaka norme.
- **Točka Pravilnika o poslovima s posebnim uvjetima rada (NN 5/84, čl. 3)** popunjena je u primjeru samo za tri reda gdje je veza s konkretnim rizikom razumna i gdje korisnički zahtjev eksplicitno navodi obrazac: "16, PROVJERITI" za teško fizičko naprezanje (dizanje tereta na skladištu), i "18 ili sljedeće, PROVJERITI" za mikroklimu (vrući okoliš kraj peći) i kemijske štetnosti (nadražljivci pri čišćenju) — bez upisivanja konkretnog broja točke za te posljednje dvije kategorije, jer točan raspored brojeva točaka čl. 3 nije pouzdano potvrđen (izvori se razilaze, vidi odjeljak gore). Vozački posao (dostava) namjerno NEMA upisanu točku Pravilnika — liječnički pregled vozača vjerojatno proizlazi iz propisa o sigurnosti prometa, ne iz NN 5/84, pa je to polje kod tog rizika ostavljeno prazno, a liječnički pregled upisan kao slobodan tekst s oznakom "provjeriti".
- **Prilog "Popis poslova s posebnim uvjetima rada"** u alatu ostaje **odluka stručnjaka** (checkbox po poslu, ne automatski upisan), ali je dodan prijedlog-gumb koji za poslove s upisanom "Točkom Pravilnika" u analizi rizika nudi jednim klikom označiti posao i predložiti tekst obrazloženja (spoj naziva rizika i upisane točke) — stručnjak i dalje mora kliknuti da prihvati. U demo-primjeru ovaj prijedlog je unaprijed prihvaćen za tri gore spomenuta posla, pa prilog nije prazan.
- **Prilog "Popis OZO" i "Popis liječničkih pregleda"** sada prikazuju samo retke gdje OZO stvarno postoji (isključeni redovi s "OZO nije potrebna") odnosno gdje je liječnički pregled stvarno upisan — umjesto da prikazuju sve srednje/velike rizike pa onda ispisuju "(nije uneseno)" za prazne.
- **Rokovi ispitivanja radne opreme i radnog okoliša** i dalje nisu pouzdano preuzeti iz propisa, pa su u primjeru dodana tri reda ispitivanja (električne instalacije, radna oprema, mikroklima) bez konkretnog roka — samo napomena "provjeriti". Periodika pregleda radne opreme (Prilog 2) ima izmišljene, ali vjerojatne brojeve mjeseci i datume, jasno u kontekstu PRIMJER banera.
- **Izvoz u Word**: tablice cjeline 3-5 (analiza rizika po poslu, plan mjera, prilozi) sada se izvoze u zasebnoj A4 landscape sekciji dokumenta (šire tablice, manje prelamanja stupaca), dok cjeline 1-2 ostaju portrait; svaka stranica ima zaglavlje s nazivom poslodavca. Pregled dokumenta (korak 7) sada prikazuje sve prilog-tablice (5.1-5.9) u cijelosti, ne samo uputu da "pogledajte korak Prilozi".

## Dodatna provjera: robusnost na stare spremljene podatke (2026-10-01, drugi krug)
Prijavljena greška: koraku "Prilozi" bijeli ekran (`TypeError: Cannot read properties of undefined (reading 'trim')`) kad localStorage sadrži podatke spremljene prije nego su u tipove dodana novija polja (npr. `tockaPravilnika`, `ozoNijePotrebna`, `periodPregledaMjeseci`, `ergonomijaOdgovori`...). Budući da je cijela aplikacija bez backend-a i cijelo stanje živi u pregledniku, svaka promjena oblika podataka u kodu potencijalno ruši povratne korisnike dok god ne počiste localStorage ručno.

Rješenje (vidi `src/state/store.ts`, `src/components/ErrorBoundary.tsx`):
- `persist` middleware (zustand) sada ima eksplicitan `version` broj i `migrate`/`merge` koji prolaze svako učitano stanje kroz normalizacijske funkcije (`normalizaPosao`, `normalizaRizik`, `normalizaRadnaOprema`, `normalizaIspitivanje`, `normalizaMjeraPlana`, `normalizaPoslodavac`, `normalizaRadnoMjesto`) — svako nedostajuće ili pogrešno tipizirano polje dobiva sigurnu zadanu vrijednost (prazan string, prazan niz, `null`) umjesto da ostane `undefined`. `merge` se izvršava pri svakom učitavanju iz localStorage (ne samo kad se broj verzije promijeni), pa je otporan i na ručno uređivanje localStorage-a.
- Svi pozivi `.trim()` na poljima koja dolaze iz spremljenog stanja (ne na lokalnom `useState` tekstu obrazaca, koji je uvijek inicijaliziran na `""`) sada koriste `(polje ?? "").trim()` kao dodatna zaštita, za slučaj da normalizacija negdje ipak propusti nešto.
- Dodan je React `ErrorBoundary` (`src/main.tsx` omata `<App />`) koji hvata svaku neuhvaćenu grešku u prikazu i nudi gumb "Počisti spremljene podatke i počni novu" (briše localStorage ključ i ponovno učitava stranicu) umjesto bijelog ekrana.
- Testirano uživo: ručno upisan localStorage u starom obliku (bez `version`, bez nijednog od novijih polja na rizicima/poslovima/opremi) — svih 7 koraka, uključujući "Prilozi", renderira se bez greške u konzoli; isto za potpuno prazan localStorage.

## Dodatna provjera: Prilog "Popis poslova s posebnim uvjetima rada" (2026-10-01, drugi krug)
Prilog 9 je promijenjen iz čisto ručnog popisa (kvačica po poslu) u automatski izveden popis: posao se automatski uključuje čim ijedan njegov rizik u analizi ima upisanu "Točku Pravilnika" (vidi `src/utils/posebniUvjeti.ts`). Kvačica za takav posao je tada onemogućena (uklanjanje se radi brisanjem točke u analizi rizika, ne u prilogu) i polje obrazloženja automatski predlaže tekst sastavljen od naziva rizika i upisane točke, uz mogućnost ručne izmjene teksta. Stručnjak i dalje može ručno dodati posao bez upisane točke (kvačica tada ostaje aktivna). Isti izračun koristi i Pregled dokumenta (korak 7) i izvoz u Word.

---

## 9. Redizajn sučelja (Tailwind + shadcn/ui obrazac)

Ovaj krug mijenja **samo prikaz i interakciju**. Logika izračuna (`izracunajRazinu`,
`razinaPosla`), domenski tipovi (`src/types.ts`) i scenarij primjera ostaju isti.

### Katalog OZO umjesto dva odvojena polja

- Novi `src/data/ozoKatalog.ts`: svaka stavka OZO **nosi svoju normu**, pa stručnjak više ne bira
  normu zasebno. Odabirom kvačice upisuju se i naziv i norma.
- Tipovi podataka **nisu mijenjani**: OZO i norme i dalje žive u `Rizik.ozoPrijedlog` i
  `Rizik.ozoNorma` kao tekst razdvojen znakom `;`. Katalog je prikazni sloj nad tim tekstom
  (`src/utils/ozo.ts`), pa izvoz u Word i prilozi čitaju isto što i prije.
- Što nije u katalogu upisuje se preko "+ Druga oprema" i prikazuje kao zasebna skupina
  ("Upisano izvan kataloga"), pa se ništa ne gubi.
- Nazivi OZO u primjeru usklađeni su s rječnikom kataloga (ista oprema, iste norme). Oznake
  normi više ne nose opisnu zagradu, jer opis sada nosi naziv stavke kataloga.
- Zagrade tipa "(zaštitna obuća)" uz oznaku norme uklonjene su iz primjera; status "provjeriti"
  ostaje, sada kao pločica PROVJERITI uz katalog i uz točku Pravilnika.

### Preporuke OZO po vrsti opasnosti

- `src/data/ozoPreporuke.ts` drži mapiranje `kategorija:kod` (Prilog III) → id-ovi stavki
  kataloga, u zasebnoj datoteci da ga stručnjak može mijenjati bez diranja koda.
- Preporuke se **nikad ne označavaju automatski** — prikazuju se pod "Često za ovu opasnost" i
  korisnik ih klikne. To je i dalje prijedlog, ne pravna tvrdnja.
- Mjere koje nisu OZO s normom (npr. "odjeća bez slobodnih dijelova" pri radu na strojevima,
  ograničenje mase ručno nošenog tereta) namjerno nisu u katalogu — pripadaju u Plan mjera.

### Panel "Provjere"

- `src/utils/provjere.ts` izvodi popis onoga što nedostaje ili je nedosljedno iz istih podataka
  koje koriste prilozi. Nema novih pravnih tvrdnji: provjerava se dosljednost unosa (veliki rizik
  bez točke Pravilnika / bez pregleda, povećani rizik bez OZO, posao s velikim rizikom bez mjere,
  radno mjesto bez radnika ili bez posla, neocijenjeni rizik, nepopunjen checklist ergonomije).
- Isti izvor hrani status svakog koraka u stepperu i brojku na nadzornoj ploči, pa se brojevi ne
  mogu razići.

### Otpornost spremljenog stanja

- `STORE_VERSION` podignut na 2; migracija i dalje samo popunjava nedostajuća polja, ne odbacuje
  podatke.
- Nova polja: `zadnjiKorak` (za "Nastavi gdje si stao"), `korisnikMijenjao` i `primjerVerzija`.
- `PRIMJER_VERZIJA` u `src/data/demoData.ts`: kad se primjer promijeni i broj se podigne,
  korisnik koji **nije ništa mijenjao** pri sljedećem otvaranju automatski dobiva novi primjer.
  Zastavicu `korisnikMijenjao` postavlja omotač oko `set` u storeu, pa je nemoguće zaboraviti je
  postaviti u novoj akciji; radnje koje mijenjaju samo prikaz koriste `rawSet`.
