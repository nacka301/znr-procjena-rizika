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
