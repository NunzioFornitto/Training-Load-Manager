# Training Load Manager (TLM)

**Training Load Manager** è un'applicazione mobile sviluppata con React Native ed Expo per monitorare e gestire il carico di allenamento in modo scientifico.

L'obiettivo dell'app è prevenire il sovrallenamento e ottimizzare le prestazioni utilizzando metriche validate come il **Volume Load** e il rapporto **Acute:Chronic Workload Ratio (ACWR)**.

## 🚀 Che cos'è 

TLM non è la solita app di fitness. È uno strumento di analisi per atleti e coach che vogliono basare le proprie decisioni sui dati. L'app permette di:

- **Live Tracking**: Segui il tuo allenamento in tempo reale, spuntando le serie completate.
- **Analisi Avanzata**: Dashboard interattiva con grafici per Volume Load e ACWR.
- **Gestione Flessibile**: Supporta sessioni di allenamento multiple nello stesso giorno e Template riutilizzabili.
- **Prevenzione**: Feedback automatici sul rischio di infortuni e autoregolazione basata sul benessere.

## 🧠 Come funziona (La Scienza)

L'app si basa su algoritmi specifici per calcolare il carico e fornire suggerimenti:

### 1. Volume Load
Il volume totale viene calcolato come:
`Volume = Serie x Ripetizioni x Carico (kg)`

### 2. ACWR (Acute:Chronic Workload Ratio)
Il cuore del sistema di prevenzione infortuni.
- **Carico Acuto (Acute Load):** Media del carico degli ultimi **7 giorni**. Rappresenta la fatica.
- **Carico Cronico (Chronic Load):** Media del carico degli ultimi **28 giorni**. Rappresenta la forma fisica (fitness).
- **Rapporto (Ratio):** Indica se stiamo facendo troppo, troppo presto.
  - **0.8 - 1.3**: Zona Ottimale (Sweet Spot).
  - **> 1.5**: Alta probabilità di infortunio (Danger Zone).

### 3. Autoregolazione (Wellness)
Il sistema incrocia i dati oggettivi (tonnellaggio) con quelli soggettivi (**Sonno, Fatica**). 
L'algoritmo penalizza pesantemente il "punteggio di rischio" se il sonno è insufficiente (1-2/5) o la fatica è estrema (5/5), suggerendo il recupero anche se i carichi matematici sembrano sicuri.

### 4. Gestione "Cold Start"
Per i nuovi utenti, l'algoritmo include una fase di adattamento intelligente che evita falsi allarmi di "Carico Eccessivo" nelle prime 4 settimane, permettendo di costruire lo storico necessario per il calcolo ACWR.

## 🌟 Funzionalità Principali

### 🔴 Live Workout Mode
Non aspettare la fine per inserire i dati. Avvia una sessione **Live** dalla Home, aggiungi esercizi o carica un template, e segna ogni serie come completata man mano che ti alleni. I dati vengono salvati in tempo reale per non perdere nulla.

### 📊 Dashboard Analitica
Una vista dedicata per esplorare i tuoi progressi:
- **Grafico Volume**: Vedi quanto stai sollevando settimana per settimana.
- **Grafico ACWR**: Visualizza la linea del tuo rapporto Acuto/Cronico per restare nella "Sweet Spot" (0.8 - 1.3).
- **Tip**: Scorri orizzontalmente per vedere lo storico passato.

### 📝 Templates & Multi-Sessione
- **Templates**: Hai una scheda fissa? Salvala come Template e richiamala con un click.
- **Sessioni Multiple**: Ti alleni mattina e sera? Nessun problema. L'app aggrega automaticamente tutte le sessioni della giornata nel calcolo del carico giornaliero, mantenendo però il dettaglio separato nella cronologia.

## 🛠️ Stack Tecnologico

L'applicazione è costruita con tecnologie moderne e performanti:

- **Framework:** [React Native](https://reactnative.dev/) (v0.81) con [Expo](https://expo.dev/) (SDK 54).
- **Linguaggio:** TypeScript per maggiore sicurezza e manutenibilità.
- **Routing:** Expo Router (file-based routing).
- **UI Kit:** React Native Paper (Material Design).
- **Charts:** `react-native-chart-kit` & `react-native-svg` per la visualizzazione dati.
- **Storage:** `async-storage` (I dati sono salvati **localmente** sul dispositivo, nessun server esterno).
- **Date Management:** `date-fns`.
- **Internazionalizzazione:** `i18next` (Supporto multilingua).

## 📱 Installazione e Avvio

### Prerequisiti
- Node.js installato.
- Un emulatore Android/iOS o un dispositivo fisico con l'app **Expo Go**.

### Comandi
1. **Clona il repository (o scarica la cartella):**
   ```bash
   git clone <url-repository>
   cd Training-Load-Manager
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Avvia l'app:**
   ```bash
   npx expo start
   ```
   - Premi `a` per aprire su Android Emulator.
   - Premi `i` per aprire su iOS Simulator.
   - Scansiona il QR code con l'app Expo Go per provare sul telefono.

### 📦 Alternativa Rapida (Android)
Se non vuoi installare l'ambiente di sviluppo, puoi scaricare l'ultimo APK compilato direttamente dalla **CI/CD Pipeline** di GitHub:
1. Vai nella scheda **Actions** del repository.
2. Clicca sull'ultimo workflow completato con successo.
3. Scorri in basso alla sezione **Artifacts** e scarica il file `app-release`.


## 🔒 Privacy e Dati
L'applicazione funziona completamente **offline**. Tutti i dati relativi agli allenamenti e alle statistiche personali sono salvati esclusivamente nella memoria del tuo dispositivo. Nessun dato viene inviato a server esterni.

## 📄 Licenza
Questo progetto è Open Source e distribuito sotto licenza **MIT**. 
Vedi il file [LICENSE](LICENSE) per maggiori dettagli.