// Declare an IIFE (Immediately Invoked Function Expression)
(function () {
  "use strict";

  const STORAGE_KEY = "puslecare_triage_records_v1";

  const greenhouseForm = document.getElementById("greenhouse-form");
  const errorBanner = document.getElementById("form-error-banner");
  const recordsList = document.getElementById("records-list");
  const logCount = document.getElementById("log-count");
  const emptyState = document.getElementById("empty-state");
  const btnClearAll = document.getElementById("btn-clear-all");

  const inputName = document.getElementById("user-name");
  const inputPH = document.getElementById("ph");
  const inputEC = document.getElementById("ec");
  const inputTemp = document.getElementById("temp");
  const inputRH = document.getElementById("rh");

  //   as above, it goes inputName, inputSystolic, inputDiastolic,
  //                     inputTemp, and inputHeartRate
  //                     COMPLETELY REMOVE inputSpo2 stuff!!!!!!!!!!!!!!!!!

  let records = loadRecords();

  render();

  function loadRecords() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load records from local storage:", error);
      return [];
    }
  }

  function saveRecords() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Failed to save records to local storage:", error);
    }
  }

  function evaluateRisk(ph, ec, temp, rh) {
    console.log("pH:", ph);
    console.log("EC:", ec);
    console.log("Temperature:", temp);
    console.log("Humidity:", rh);

    console.log("pH critical:", ph < 5.0 || ph > 7.5);
    console.log("Temperature critical:", temp < 55 || temp > 95);
    console.log("EC critical:", ec < 0.2 || ec > 4.5);
    console.log("Humidity critical:", rh < 30 || rh > 90);

    if (
      (ph < 5.0 || ph > 7.5) &&
      (temp < 55 || temp > 95) &&
      (ec < 0.2 || ec > 4.5) &&
      (rh < 30 || rh > 90)
    ) {
      return { level: "critical", label: "Critical" };
    }

    if (
      ph >= 5.5 &&
      ph <= 6.5 &&
      temp >= 64.4 &&
      temp <= 71.6 &&
      ec >= 1.0 &&
      ec <= 2.0 &&
      rh >= 50 &&
      rh <= 70
    ) {
      return { level: "optimal", label: "Optimal" };
    }

    return { level: "warning", label: "Warning" };
  }

  // Validate form input
  function validateInput(data) {
    const errors = [];

    if (!data.name.trim()) {
      errors.push("Full Name is a required field.");
    }

    if (!Number.isFinite(data.ph) || data.ph < 0 || data.ph > 14) {
      errors.push("pH must be a number between 0 and 14.");
    }

    if (!Number.isFinite(data.ec) || data.ec < 0) {
      errors.push("Electrical Conductivity must be a number above 0 mS/cm.");
    }

    if (!Number.isFinite(data.rh) || data.rh < 0 || data.rh > 100) {
      errors.push(
        "Relative Humidity must be a valid percentage between 0% and 100%.",
      );
    }

    if (!Number.isFinite(data.temp)) {
      errors.push("Air Temperature is a required field.");
    }

    return errors;
  }

  greenhouseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {
      id: crypto.randomUUID(),
      name: inputName.value.trim(),
      ph: Number(inputPH.value),
      ec: Number(inputEC.value),
      temp: Number(inputTemp.value),
      rh: Number(inputRH.value),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const validationErrors = validateInput(formData);

    if (validationErrors.length > 0) {
      displayError(validationErrors.join(" "));
      return;
    }

    hideError();

    formData.risk = evaluateRisk(
      formData.ph,
      formData.ec,
      formData.temp,
      formData.rh,
    );

    records.unshift(formData);

    saveRecords();
    render();

    greenhouseForm.reset();
    inputName.focus();
  });

  recordsList.addEventListener("click", (event) => {
    const target = event.target.closest(".btn-discharge");

    if (!target || !recordsList.contains(target)) {
      return;
    }

    const recordId = target.dataset.id;

    records = records.filter((record) => record.id !== recordId);

    saveRecords();
    render();
  });

  btnClearAll.addEventListener("click", () => {
    if (records.length === 0) return;

    if (confirm("Are you sure you want to delete all patient records?")) {
      records = [];
      saveRecords();
      render();
    }
  });

  function render() {
    logCount.textContent = records.length;

    if (records.length === 0) {
      emptyState.classList.remove("hidden");
      recordsList.innerHTML = "";
      return;
    }

    emptyState.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    records.forEach((rec) => {
      const li = document.createElement("li");
      li.className = "patient-card status-" + rec.risk.level;

      li.innerHTML = `
        <div class="card-top">
          <div>
            <div class="patient-name-text">${escapeHtml(rec.name)}</div>
            <div class="timestamp">Logged at ${escapeHtml(rec.timestamp)}</div>
            <span class="risk-badge ${rec.risk.level}">
              ${escapeHtml(rec.risk.label)}
            </span>
          </div>

          <div class="vital-stats">
            <div class="stat-item">
              <span>pH level:</span>
              ${rec.ph}
            </div>
            <div class="stat-item">
              <span>Electrical Conductivity (mS/cm)</span>
              ${rec.ec} bpm
            </div>
            <div class="stat-item">
              <span>Temperature</span>
              ${Number(rec.temp).toFixed(1)} °F
            </div>            
            <div class="stat-item">
              <span>Relative Humidity</span>
              ${rec.rh} bpm
            </div>
          </div>

          <button
            type="button"
            class="btn btn-outline-danger btn-sm btn-discharge"
            data-id="${escapeHtml(rec.id)}"
          >
            Delete
          </button>
        </div>
      `;

      fragment.appendChild(li);
    });

    recordsList.innerHTML = "";
    recordsList.appendChild(fragment);
  }

  function displayError(message) {
    errorBanner.textContent = message;
    errorBanner.classList.remove("hidden");
  }

  function hideError() {
    errorBanner.textContent = "";
    errorBanner.classList.add("hidden");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });
  }
})();
