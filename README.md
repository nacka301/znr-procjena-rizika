# Procjena rizika – prototip

Klikabilan prototip web alata za izradu procjene rizika (ZNR) prema Pravilniku o izradi
procjene rizika (NN 112/14, NN 129/19). Vite + React + TypeScript, bez backenda, svi podaci u
localStorage preglednika. Vidi [DOMAIN_NOTES.md](./DOMAIN_NOTES.md) za pravni izvor i popis onoga
što je potvrđeno izvorom nasuprot onome što je uredivi prijedlog ("provjeriti prije korištenja").

## Pokretanje

```bash
npm install
npm run dev
```

Otvara se na `http://localhost:5173`.

## Izvoz

```bash
npm run build
```

Statični `dist/` direktorij, spreman za deploy na Vercel (ili bilo koji statični hosting) bez
dodatne konfiguracije.

## Napomena

Alat priprema i računa (matrica rizika, automatski prilozi); stručnjak uvijek sam odlučuje
(vjerojatnost, posljedica, OZO, poslovi s posebnim uvjetima rada). Nema AI-generiranih
zaključaka o rizicima. Svi demo podaci ("Primjer d.o.o.") su izmišljeni i jasno označeni.
