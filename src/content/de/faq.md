# Benutzeranleitung

Willkommen bei RAGold!
Dieses Tool hilft Ihnen, Trainingsbeispiele für Retrieval-Augmented Generation (RAG) Systeme zu erstellen.
Folgen Sie diesen Schritten, um Ihre erste Annotation zu erstellen.

### Schritt 1: Projekt einrichten

Füllen Sie die Felder **Autor** und **Projekt** oben auf der Seite aus.
Diese Metadaten sind erforderlich, bevor Sie Ihre Annotationen exportieren können.
Optional können Sie auch eine **Beschreibung** für den Datensatz hinzufügen.

### Schritt 2: Dokumente hinzufügen (optional)

Gehen Sie zum Tab **Dokumente**, um Referenzdokumente hinzuzufügen.
Dokumente helfen Ihnen zu organisieren, welche Textausschnitte aus welcher Quelle stammen.
Sie können diesen Schritt überspringen und Ausschnitte manuell hinzufügen.

### Schritt 3: Annotation erstellen

Wechseln Sie zum Tab **Neue Annotation** und füllen Sie aus:

1. **Nutzeranfrage**: Schreiben Sie eine Frage, wie ein Nutzer sie in einem Chat-System stellen würde.
2. **Fragetyp**: Wählen Sie, wie die Frage zum Kontext steht:
   - _Einzelfakt_: Die Antwort ist eine einzelne Information im Dokument.
   - _Zusammenfassung_: Die Antwort erfordert das Kombinieren mehrerer Informationen.
   - _Schlussfolgerung_: Die Antwort muss durch logisches Schließen abgeleitet werden.
   - _Unbeantwortbar_: Die Antwort kann nicht im Kontext gefunden oder abgeleitet werden.
3. **Relevante Dokumentausschnitte**: Fügen Sie Textpassagen hinzu, die die Informationen zur Beantwortung der Frage enthalten.
4. **Ablenkende Ausschnitte** (optional): Fügen Sie Passagen hinzu, die relevant erscheinen könnten, aber das System irreführen würden.
5. **Erwartete Antwort**: Schreiben Sie die ideale Antwort, die das System geben sollte.
6. **Anmerkungen** (optional): Fügen Sie besondere Hinweise zu diesem Beispiel hinzu.

Bei **unbeantwortbaren** Anfragen sind relevante Dokumentausschnitte und die erwartete Antwort optional.

### Schritt 4: Überprüfen und Exportieren

Nutzen Sie den Tab **Annotationen**, um alle Ihre Annotationen zu überprüfen.
Sie können Annotationen nach Bedarf bearbeiten oder löschen.
Wenn Sie fertig sind, klicken Sie auf **Export** in der Kopfzeile, um Ihren Datensatz als JSON herunterzuladen.

## Import und Export

### Arbeit exportieren

Der **Export**-Button in der Kopfzeile lädt Ihren kompletten Datensatz als JSON-Datei herunter.
Der Dateiname enthält das aktuelle Datum und die Uhrzeit (`ragold-YYYYMMDD-HHMMSS.json`).

Bevor Sie exportieren können, müssen Sie:

- Die Felder **Autor** und **Projekt** ausfüllen
- Mindestens eine Annotation erstellen

Die exportierte Datei enthält:

- Alle Projektmetadaten (Autor, Projekt, Beschreibung)
- Alle Annotationen mit ihren Anfragen, Ausschnitten und Antworten
- Alle Dokumente aus der Dokumentbibliothek

### Daten importieren

Der **Import**-Button ermöglicht das Laden von Annotationen aus einer zuvor exportierten JSON-Datei.
Dies ist nützlich für:

- Fortsetzung der Arbeit aus einer vorherigen Sitzung
- Zusammenarbeit mit anderen durch Austausch von Exportdateien

Beim Importieren:

- Wählen Sie eine `.json`-Datei, die aus RAGold exportiert wurde
- Alle vorhandenen Annotationen und Dokumente werden durch die importierten Daten ersetzt
- Projektmetadaten (Autor, Projekt, Beschreibung) werden ebenfalls ersetzt
- Sie werden vor dem Import um Bestätigung gebeten
- Diese Aktion kann nicht rückgängig gemacht werden, daher sollten Sie vorher Ihre aktuellen Daten exportieren

### Daten zurücksetzen

Der **Reset**-Button löscht alle Annotationen und Dokumente.
Klicken Sie einmal, um die Bestätigungsaufforderung zu sehen, dann klicken Sie innerhalb von 3 Sekunden erneut zur Bestätigung.
Diese Aktion kann nicht rückgängig gemacht werden, daher sollten Sie vorher exportieren.

## Tipps für gute Annotationen

- Schreiben Sie Anfragen in natürlicher Sprache, wie echte Nutzer sie formulieren würden.
- Fügen Sie genügend Kontext in die Ausschnitte ein, damit die Antwort tatsächlich abgeleitet werden kann.
- Bei unbeantwortbaren Anfragen sollte die erwartete Antwort erklären, warum die Frage nicht beantwortet werden kann.
- Verwenden Sie ablenkende Ausschnitte sparsam, um herausfordernde Beispiele zu erstellen.
- Fügen Sie Anmerkungen hinzu, wenn es Mehrdeutigkeiten oder besondere Überlegungen gibt.

## Was sind Fragetypen?

Die Fragetypen basieren auf der "Know Your RAG"-Taxonomie:

- **Einzelfakt**: Einfache Suche, die Antwort steht direkt an einer Stelle.
- **Zusammenfassung**: Antwort erfordert das Zusammenfassen von Informationen aus mehreren Teilen.
- **Schlussfolgerung**: Antwort ist nicht explizit, kann aber logisch abgeleitet werden.
- **Unbeantwortbar**: Die Information ist einfach nicht im bereitgestellten Kontext vorhanden.
