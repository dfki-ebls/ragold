# Benutzeranleitung

Willkommen bei RAGold!
Dieses Tool hilft Ihnen, Testbeispiele für Retrieval-Augmented Generation (RAG) Systeme zu erstellen.
Jedes Beispiel besteht aus einer Frage, den Passagen Ihrer Dokumente, auf die es ankommt, und der idealen Antwort mit ihren Kernaussagen.
Folgen Sie diesen Schritten, um Ihre erste Annotation zu erstellen.

### Schritt 1: Projekt einrichten

Füllen Sie die Felder **Autor** und **Projekt** oben auf der Seite aus.
Diese Felder sind erforderlich, bevor Sie Ihre Annotationen exportieren können.
Optional können Sie **Anmerkungen** zum Datensatz hinzufügen.

### Schritt 2: Dokumente hochladen

Gehen Sie zum Tab **Dokumente**, um Ihre Referenzdokumente hochzuladen.
Sie können Dateien per Drag-and-Drop ablegen oder klicken, um sie auszuwählen, auch mehrere auf einmal.
Jeder Dateityp wird akzeptiert, mit einer maximalen Größe von 10 MB pro Datei.
Jedes Dokument erhält einen kurzen Fingerabdruck seines Inhalts.
Laden Sie eine Datei hoch, deren Inhalt bereits vorhanden ist, weist RAGold darauf hin und behält das vorhandene Dokument.
Über **Bearbeiten** in der Dokumentbibliothek können Sie ein Dokument umbenennen, seine Datei ersetzen oder **Anmerkungen** hinzufügen.
RAGold fragt vor dem Löschen eines Dokuments nach, und wenn Passagen es verwenden, werden diese ebenfalls entfernt.

### Schritt 3: Annotation erstellen

Wechseln Sie zum Tab **Annotationen** und füllen Sie aus:

1. **Frage**: Schreiben Sie die Frage so, wie ein Nutzer sie in einem Chat-System stellen würde.
2. **Art der Frage**: Wählen Sie, was es braucht, um die Frage zu beantworten. Jede Option zeigt ein Beispiel.
3. **Können die Dokumente sie beantworten?**: Wählen Sie, ob die Dokumente die Frage vollständig, teilweise oder gar nicht beantworten.
4. **Passagen**: Markieren Sie die Stellen Ihrer Dokumente, auf die es für die Antwort ankommt (siehe unten).
5. **Ideale Antwort** und **Kernaussagen**: Schreiben Sie die Antwort und markieren Sie dann ihre Kernaussagen (siehe unten).
6. **Anmerkungen** (optional): Fügen Sie besondere Hinweise zu diesem Beispiel hinzu.

Nichts ist vorausgewählt, daher ist jede Art, Beantwortbarkeit und Einstufung eine bewusste Entscheidung.

Das Formular zeigt Hinweise bei ungewöhnlichen Kombinationen, etwa wenn eine als nicht beantwortbar markierte Frage notwendige Passagen hat.
Diese Hinweise verhindern das Speichern nicht.

#### Passagen hinzufügen

Klicken Sie auf **Aus Dokument hinzufügen**, um die Dokumentansicht zu öffnen, und wählen Sie oben ein Dokument.
PDF-Dateien, Word-Dokumente (.docx), Excel-Arbeitsmappen (.xlsx) und Textdateien wie .txt, .md, .csv oder .json werden direkt angezeigt.
Markieren Sie den relevanten Text mit der Maus oder ziehen Sie in einer Arbeitsmappe über Zellen, dann fragt ein kleines Popup, wie wichtig die Passage ist:

- _Notwendig_: Wird für die Antwort zwingend gebraucht.
- _Hilfreich_: Liefert nützlichen Kontext, ist aber nicht zwingend.
- _Irreführend_: Wirkt relevant, würde aber zu einer falschen Antwort führen.

Die Ansicht bleibt geöffnet, sodass Sie mehrere Passagen nacheinander hinzufügen und sie mit **Fertig** schließen können.
RAGold merkt sich, wo jede Passage gefunden wurde, etwa die Seite eines PDFs, die Überschrift in einem Word-Dokument, die Zeilen einer Textdatei oder den Zellbereich einer Arbeitsmappe.
Bei Bildern und anderen Dateitypen wie CAD-Zeichnungen oder alten Office-Formaten öffnen Sie die Datei mit **Datei öffnen** und nutzen **Passage von Hand eingeben**, um den Text einzufügen und die Fundstelle zu beschreiben.
Im Formular können Sie die Einstufung einer Passage ändern, sie entfernen oder über die Lupe im Dokument anzeigen.

#### Kernaussagen markieren

Schreiben Sie die ideale Antwort und markieren Sie dann Wörter darin, und ein Popup lässt Sie diese als _Muss erwähnt werden_ oder _Sollte erwähnt werden_ festlegen.
Kernaussagen werden in der Antwort hervorgehoben und darunter aufgelistet.
Ändern Sie die Antwort später so, dass eine Kernaussage nicht mehr darin vorkommt, wird diese markiert, und Sie können sie entfernen oder den Wortlaut wiederherstellen.

### Schritt 4: Überprüfen und Exportieren

Ihre Annotationen erscheinen unterhalb des Formulars im Tab **Annotationen**.
Sie können Annotationen aufklappen, bearbeiten und löschen.
Wenn Sie fertig sind, klicken Sie auf **Export** in der Kopfzeile, um Ihren Datensatz als Zip-Archiv herunterzuladen.
{{CONTACT_NOTE}}

## Import und Export

### Arbeit exportieren

Das exportierte Zip-Archiv (`ragold-YYYYMMDD-HHMMSS.zip`) enthält eine `annotations.json`-Datei mit allen Projektmetadaten und Annotationen sowie die hochgeladenen Dokumentdateien.
Sie müssen die Felder **Autor** und **Projekt** ausfüllen und mindestens eine Annotation erstellen, bevor Sie exportieren können.

### Daten importieren

Der **Import**-Button fügt die Annotationen und Dokumente eines exportierten Zip-Archivs zum aktuellen Projekt hinzu.
Dokumente mit demselben Inhalt wie vorhandene werden wiederverwendet, und bei einem ungültigen Archiv wird nichts importiert.
Autor, Projekt und Anmerkungen des Archivs werden nur übernommen, wenn das aktuelle Projekt noch leer ist.
Ein Bestätigungsdialog erscheint vor dem Import.

### Übernahme aus hivegent

In hivegent können Sie eine Unterhaltung an RAGold senden.
RAGold öffnet sich in einem neuen Tab und fragt, ob die Annotation zusammen mit den zitierten Dokumenten hinzugefügt werden soll.
Solche Annotationen tragen ein Abzeichen **Aus Unterhaltung**, das zur Unterhaltung zurückführt.
Ihre Passagen haben meist noch keine Fundstelle, daher sucht die Dokumentansicht den Text der Passage im Dokument und hebt ihn hervor, wenn Sie auf die Lupe klicken.
RAGold findet Passagen auch dann, wenn Zeilenumbrüche, Silbentrennung oder Formatierung vom Dokument abweichen.

### Daten zurücksetzen

Der **Reset**-Button löscht alle Annotationen, Dokumente und gespeicherten Dateien.
Klicken Sie einmal, um die Bestätigungsaufforderung zu sehen, dann klicken Sie innerhalb von 3 Sekunden erneut zur Bestätigung.

## Hintergrund

Die Arten von Fragen folgen den Fragetypen des CRAG-Benchmarks ([Yang et al. 2024](https://doi.org/10.52202/079017-0335)): simple, simple with condition, comparison, aggregation, set, multi-hop, post-processing und false premise.
Die Optionen zur Beantwortbarkeit folgen MTRAG ([Katsis et al. 2025](https://arxiv.org/abs/2501.03468)): answerable, partial und unanswerable.
Der Export verwendet diese Originalbezeichnungen, damit sich die Daten mit anderen RAG-Benchmarks vergleichen lassen.

## Tipps für gute Annotationen

- Schreiben Sie Fragen in natürlicher Sprache, wie echte Nutzer sie formulieren würden.
- Wählen Sie Passagen großzügig genug, dass sich die Antwort tatsächlich daraus ableiten lässt.
- Bei unbeantwortbaren Fragen sollte die ideale Antwort erklären, warum die Frage nicht beantwortet werden kann.
- Fügen Sie irreführende Passagen hinzu, um herausfordernde Beispiele zu erstellen, die das System auf die Probe stellen.
- Halten Sie Kernaussagen kurz, ein Name, eine Zahl oder eine kurze Aussage ist meist am besten.
- Fügen Sie Anmerkungen hinzu, wenn es Mehrdeutigkeiten oder besondere Überlegungen gibt.
- Nutzen Sie KI-Tools wie [ChatGPT](https://chatgpt.com) zum Entwerfen idealer Antworten: Geben Sie Ihre Frage ein, prüfen Sie die Antwort und passen Sie diese an Ihre Dokumente und Ihr Fachwissen an (sofern von Ihrer Organisation erlaubt).
- Behandeln Sie KI-generierte Antworten als Ausgangspunkt und stellen Sie sicher, dass die ideale Antwort korrekt ist und auf Ihren Passagen beruht.
