const KEY = "clockPayroll:punches:v1";

export function loadPunches() {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function savePunches(punches) {
    localStorage.setItem(KEY, JSON.stringify(punches));
}

const PAY_KEY = "clockPayroll:paySettings:v1";

export function loadPaySettings() {
    try {
      const raw = localStorage.getItem(PAY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePaySettings(settings) {
    localStorage.setItem(PAY_KEY, JSON.stringify(settings));
}