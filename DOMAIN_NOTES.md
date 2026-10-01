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
- **Pravilnik o poslovima s posebnim uvjetima rada** — temeljni tekst je NN 5/84 (1984.), vrlo star; prema izvorima i dalje se primjenjuje u dijelu koji nije u suprotnosti s važećim Zakonom o ZNR, ali bez novijeg pročišćenog teksta koji bih mogao pouzdano citirati. Popis poslova s posebnim uvjetima rada u alatu je zato prazan/uredivo polje koje stručnjak sam popunjava za svaki posao, ne unaprijed popunjen katalog. (Ova napomena o izvoru namjerno nije u sučelju alata — korisnik tamo vidi samo neutralnu formulaciju da odluku donosi stručnjak, uz oznaku "provjeriti"; detalj o starosti propisa ostaje interna bilješka ovdje.)
- **Rokovi i vrste ispitivanja radne opreme/radnog okoliša** — nisu detaljno dohvaćeni iz Pravilnika o ispitivanju radnog okoliša i radne opreme; polje je uredivo.
- **Zakon o zaštiti na radu, pročišćeni tekst** — dohvaćen samo sažetak (NN 71/14, 118/14, 94/18, 96/18 kao sastavnice). Korišten je samo za opći kontekst (obveze poslodavca, sudjelovanje radnika/odbora ZNR), ne za konkretne brojčane/postupovne detalje u alatu.

## Zaključak za dizajn alata
Alat ugrađuje kao **činjenice** (potvrđeno izvorom): 4 faze postupka, Prilog I matricu, puni Prilog III popis, čl. 11 popis obveznih priloga. Sve ostalo vezano za OZO, liječničke preglede i poslove s posebnim uvjetima rada je **uredivi prijedlog** vidno označen "provjeriti prije korištenja", bez unaprijed upisanih gotovih vrijednosti koje bi se mogle pogrešno shvatiti kao propisane. Stručnjak uvijek sam bira vjerojatnost i posljedicu za svaki rizik — alat samo izračunava razinu po matrici; nema AI-generiranih zaključaka o rizicima.
