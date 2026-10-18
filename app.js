(function () {
  "use strict";

  const STORAGE_KEY = "puslecare_triage_records_v1";

  const vitalsForm = document.getElementById("vitals-form");
  const errorBanner = document.getElementById("form-error-banner");
  const recordsList = document.getElementById("records-list");
  const queueCount = document.getElementById("queue-count");
  const emptyState = document.getElementById("empty-state");
  const btnClearAll = document.getElementById("btn-clear-all");

  const inputName = document.getElementById("patient-name");
  const inputSystolic = document.getElementById("systolic");
  const inputDiastolic = document.getElementById("diastolic");
  const inputHeartRate = document.getElementById("heart-rate");
  const inputSpo2 = document.getElementById("spo2");
  const inputTemp = document.getElementById("temperature");

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

  function evaluateRisk(systolic, diastolic, hr, spo2) {
    if (systolic >= 180 || diastolic >= 120 || spo2 < 90 || hr >= 130) {
      return { level: "critical", label: "Critical" };
    }

    if (systolic >= 130 || diastolic >= 80 || hr >= 100 || hr < 50) {
      return { level: "elevated", label: "Elevated" };
    }

    return { level: "normal", label: "Normal" };
  }

  // Validate form input
  function validateInput(data) {
    const errors = [];

    if (!data.name.trim()) {
      errors.push("Patient Name is a required field.");
    }

    if (
      !Number.isFinite(data.systolic) ||
      data.systolic < 60 ||
      data.systolic > 260
    ) {
      errors.push("Systolic BP must be a number between 60 and 260 mmHg.");
    }

    if (
      !Number.isFinite(data.diastolic) ||
      data.diastolic < 40 ||
      data.diastolic > 150
    ) {
      errors.push("Diastolic BP must be a number between 40 and 150 mmHg.");
    }

    if (!Number.isFinite(data.hr) || data.hr < 30 || data.hr > 240) {
      errors.push("Pulse must be a number between 30 and 240 bpm.");
    }

    if (!Number.isFinite(data.spo2) || data.spo2 < 50 || data.spo2 > 100) {
      errors.push("SpO2 must be a number between 50 and 100%.");
    }

    if (!Number.isFinite(data.temp) || data.temp < 90 || data.temp > 110) {
      errors.push("Body temperature must be a number between 90 and 110°F.");
    }

    return errors;
  }

  vitalsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {
      id: crypto.randomUUID(),
      name: inputName.value.trim(),
      systolic: Number(inputSystolic.value),
      diastolic: Number(inputDiastolic.value),
      hr: Number(inputHeartRate.value),
      spo2: Number(inputSpo2.value),
      temp: Number(inputTemp.value),
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
      formData.systolic,
      formData.diastolic,
      formData.hr,
      formData.spo2,
    );

    records.unshift(formData);

    saveRecords();
    render();

    vitalsForm.reset();
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
    queueCount.textContent = records.length;

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
              <span>Blood Pressure</span>
              ${rec.systolic}/${rec.diastolic} mmHg
            </div>
            <div class="stat-item">
              <span>Pulse</span>
              ${rec.hr} bpm
            </div>
            <div class="stat-item">
              <span>Oxygen (SpO2)</span>
              ${rec.spo2}%
            </div>
            <div class="stat-item">
              <span>Temperature</span>
              ${Number(rec.temp).toFixed(1)} °F
            </div>
          </div>

          <button
            type="button"
            class="btn btn-outline-danger btn-sm btn-discharge"
            data-id="${escapeHtml(rec.id)}"
          >
            Discharge Patient
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
