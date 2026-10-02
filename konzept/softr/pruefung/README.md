# Playwright-Prüfskripte für die Softr-App

Aufruf aus dem Repo-Root (Playwright ist Dev-Abhängigkeit):

```sh
PREVIEW_URL='<Link aus application_preview>' TESTFOTO=/pfad/zu/foto.jpg node konzept/softr/pruefung/test-bestand.mjs
```

- `PREVIEW_URL` ist ein Zugangsschlüssel (meldet als Admin an, ca. 24 h gültig). Er gehört nie ins Repo.
- Screenshots landen in `konzept/vergleich/softr-*.png`.
- `test-erfassen.mjs` und `test-runde2.mjs` legen Test-Datensätze an. Die anderen ändern nur, was sie gleich wieder zurücksetzen (±1), oder speichern eine Beispiel-Ansicht.
