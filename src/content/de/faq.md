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
Jedes Dokument hat einen Dateinamen und eine Beschreibung.
Wenn Sie später Ausschnitte erstellen, können Sie jeden Ausschnitt einem dieser Dokumente zuordnen.
Sie können diesen Schritt überspringen und Ausschnitte manuell hinzufügen.

### Schritt 3: Annotation erstellen

Wechseln Sie zum Tab **Annotationen** und füllen Sie aus:

1. **Nutzeranfrage**: Schreiben Sie eine Frage, wie ein Nutzer sie in einem Chat-System stellen würde.
2. **Fragetyp**: Wählen Sie, wie die Frage zum Kontext steht (basierend auf der „Know Your RAG"-Taxonomie):
   - _Einzelfakt_: Einfache Suche — die Antwort steht direkt an einer Stelle.
   - _Zusammenfassung_: Die Antwort erfordert das Zusammenfassen von Informationen aus mehreren Teilen.
   - _Schlussfolgerung_: Die Antwort ist nicht explizit, kann aber logisch abgeleitet werden.
   - _Unbeantwortbar_: Die Information ist nicht im bereitgestellten Kontext vorhanden.
3. **Relevante Dokumentausschnitte**: Fügen Sie Textpassagen hinzu, die die Informationen zur Beantwortung der Frage enthalten.
4. **Ablenkende Ausschnitte** (optional): Fügen Sie Passagen hinzu, die relevant erscheinen könnten, aber das System irreführen würden.
5. **Erwartete Antwort**: Schreiben Sie die ideale Antwort, die das System geben sollte.
6. **Anmerkungen** (optional): Fügen Sie besondere Hinweise zu diesem Beispiel hinzu.

Bei **unbeantwortbaren** Anfragen sind relevante Dokumentausschnitte und die erwartete Antwort optional.

### Schritt 4: Überprüfen und Exportieren

Ihre Annotationen erscheinen unterhalb des Formulars im Tab **Annotationen**.
Sie können Annotationen aufklappen, bearbeiten und löschen.
Wenn Sie fertig sind, klicken Sie auf **Export** in der Kopfzeile, um Ihren Datensatz als JSON herunterzuladen.

## Import und Export

### Arbeit exportieren

Die exportierte JSON-Datei (`ragold-YYYYMMDD-HHMMSS.json`) enthält alle Projektmetadaten, Annotationen und Dokumente.
Sie müssen die Felder **Autor** und **Projekt** ausfüllen und mindestens eine Annotation erstellen, bevor Sie exportieren können.

### Daten importieren

Der **Import**-Button lädt eine zuvor exportierte JSON-Datei und ersetzt dabei alle aktuellen Daten (Annotationen, Dokumente und Metadaten).
Ein Bestätigungsdialog erscheint vor dem Import.
Diese Aktion kann nicht rückgängig gemacht werden, daher sollten Sie vorher Ihre aktuellen Daten exportieren.

### Daten zurücksetzen

Der **Reset**-Button löscht alle Annotationen und Dokumente.
Klicken Sie einmal, um die Bestätigungsaufforderung zu sehen, dann klicken Sie innerhalb von 3 Sekunden erneut zur Bestätigung.

## Tipps für gute Annotationen

- Schreiben Sie Anfragen in natürlicher Sprache, wie echte Nutzer sie formulieren würden.
- Fügen Sie genügend Kontext in die Ausschnitte ein, damit die Antwort tatsächlich abgeleitet werden kann.
- Bei unbeantwortbaren Anfragen sollte die erwartete Antwort erklären, warum die Frage nicht beantwortet werden kann.
- Fügen Sie ablenkende Ausschnitte hinzu, um herausfordernde Beispiele zu erstellen, die das System auf die Probe stellen.
- Fügen Sie Anmerkungen hinzu, wenn es Mehrdeutigkeiten oder besondere Überlegungen gibt.

## KI-Tools zur Inspiration nutzen

Sie können Tools wie [ChatGPT](https://chatgpt.com) nutzen, um eine grobe Vorstellung einer guten Antwort zu bekommen (sofern von Ihrer Organisation erlaubt).
Geben Sie Ihre Nutzeranfrage ein, sehen Sie sich die generierte Antwort an und passen Sie diese an Ihre spezifischen Dokumente und Ihr Fachwissen an.
KI-generierte Antworten sind ein Ausgangspunkt — stellen Sie immer sicher, dass die erwartete Antwort korrekt ist und auf Ihren tatsächlichen Dokumentausschnitten basiert.
