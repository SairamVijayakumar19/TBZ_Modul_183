# TBZ_Modul_183

# LB2 – Abschluss Phase 1

## Sicherheitsanalyse & Fixes

Im Rahmen der Projektarbeit wurden folgende sicherheitsrelevanten Schwachstellen (S1–S9) in der TODO-App identifiziert und vollständig behoben.

---

## Behobene Sicherheitsmängel

| Mangel | Titel                                       | Status   | Maßnahmen                                                                 |
|--------|---------------------------------------------|----------|---------------------------------------------------------------------------|
| **S1** | SQL-Injection                               | ✅ Behoben | Prepared Statements überall eingesetzt (`?`-Syntax).                      |
| **S2** | Klartext-Passwörter                         | ✅ Behoben | Passwort-Ausgabe im HTML entfernt. Keine Speicherung im Klartext.        |
| **S3** | Kein Passwort-Hashing                       | ✅ Behoben | Passwörter werden mit `bcrypt` sicher gehasht.                           |
| **S4** | Cross-Site Scripting (XSS)                  | ✅ Behoben | Alle Outputs über `escapeHTML()` abgesichert.                           |
| **S5** | Unsicheres Session-Handling                 | ✅ Behoben | Nur `express-session` genutzt. Cookies für Login entfernt.              |
| **S6** | Sensitive Daten im Frontend                 | ✅ Behoben | Passwort-Hashes wurden aus dem HTML entfernt.                            |
| **S7** | Keine Zugriffskontrolle auf User-Daten      | ✅ Behoben | Task-Zugriffe nur noch auf eigene Daten (`WHERE userID=?`).              |
| **S8** | Kein HTML-Escaping                          | ✅ Behoben | HTML in allen Views escaped (`tasklist`, `edit`, `index`, ...).         |
| **S9**| Fehlende Backend-Validierung                 | ✅ Behoben | Server prüft Titel & Status auf Gültigkeit.                              |


---

## Erweiterungen

| Feature                                      | Status   | Beschreibung |
|---------------------------------------------|----------|--------------|
|  Passwort-Reset                            | ✅         | User können ihr Passwort zurücksetzen. |
|  Löschen eines Benutzerkontos mit Tasks    | ✅         | Benutzer & Aufgaben können komplett gelöscht werden. |

---

##  Validierung & Tests

- Backend-validiert: `title`, `state`, `userid`
- Alle SQL-Zugriffe abgesichert
- Authentifizierte Routen geschützt
- Session-, XSS-, CSRF-, Brute-Force- & Fixation-Schutz implementiert


---

##  Fazit

Die Applikation erfüllt nun die Schutzziele:
-  Vertraulichkeit (z. B. gehashte Passwörter)
-  Integrität (nur eigene Daten veränderbar)
-  Verfügbarkeit (Brute-Force geblockt, CSRF geschützt)

 **Phase 1 vollständig abgeschlossen – bereit für Phase 2**

