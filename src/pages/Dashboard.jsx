import { useState, useEffect } from "react";
import { getCurrentPosition } from "../lib/geolocation";
import { distanceMeters } from "../lib/distance";
import { loadPunches, savePunches, loadPaySettings, savePaySettings } from "../lib/storage";
import { calculateWorkTime, buildSessions } from "../lib/payroll";

const WORKSITE = {
  name: import.meta.env.VITE_WORKSITE_NAME || "Worksite",
  lat: Number(import.meta.env.VITE_WORKSITE_LAT),
  lng: Number(import.meta.env.VITE_WORKSITE_LNG),
  radiusMeters: Number(import.meta.env.VITE_WORKSITE_RADIUS_METERS || 150),
  maxAccuracyMeters: Number(import.meta.env.VITE_MAX_GPS_ACCURACY_METERS || 80),
};

function prettyGeoError(err) {
  if (err?.code === 1) return "Location permission denied.";
  if (err?.code === 2) return "Location unavailable (try again).";
  if (err?.code === 3) return "Location request timed out (try again).";
  return err?.message || "Could not get location.";
}

export default function Dashboard() {
  const [status, setStatus] = useState("Not clocked in");
  const [lastReading, setLastReading] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [punches, setPunches] = useState(() => loadPunches());
  const [paySettings, setPaySettings] = useState(() => {
    const saved = loadPaySettings();
    return saved ?? { hourlyRate: "", flatRate: ""};
  });

  const [now, setNow] = useState(Date.now());

useEffect(() => {
  savePunches(punches);
}, [punches]);

useEffect(() => {
  savePaySettings(paySettings);
}, [paySettings]);

useEffect(() => {
  const last = punches.length ? punches[punches.length - 1] : null;
  if (last?.type !=="OUT") return;

  const id = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(id);
}, [punches]);

const payroll = calculateWorkTime(punches) ?? {hoursWorked: 0 };
const sessions = buildSessions(punches);

const hoursWorked = Number(payroll.hoursWorked ?? 0);

const estimatedPay = 
  hoursWorked * Number(paySettings.hourlyRate || 0) +
  Number(paySettings.flatRate || 0);

const isClockedIn =
  punches.length > 0 && punches[punches.length - 1].type === "IN";

const BREAK_MINUTES = 30;
const BREAK_MS = BREAK_MINUTES * 60 * 1000;

const lastPunch = punches.length ? punches[punches.length - 1] : null;

const breakRemainingMs =
  lastPunch?.type === "OUT"
    ? Math.max(0, BREAK_MS - (now - new Date(lastPunch.time).getTime()))
    : 0;

const canClockInFromBreak = breakRemainingMs === 0;

  function resetDemo() {
    setPunches([]);
    setLastReading(null);
    setError("");
    setBusy(false);
    setStatus("Not clocked in");
    setPaySettings({ hourlyRate: "", flatRate: "" });
  }

  async function clockIn() {

    if (isClockedIn) {
      setStatus("Already clocked in. Clock out first.");
      return;
    }
    if (lastPunch?.type === "OUT" && !canClockInFromBreak) {
      const mins = Math.ceil(breakRemainingMs / 60000);
      setStatus(`Break not finished yet. Try again in ~${mins} minute(s).`);
      return;
    }

    setError("");
    setBusy(true);
    setStatus("Getting GPS…");

    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude, accuracy } = pos.coords;

      const d = distanceMeters(latitude, longitude, WORKSITE.lat, WORKSITE.lng);
      const within = d <= WORKSITE.radiusMeters;
      const accuracyOk = accuracy <= WORKSITE.maxAccuracyMeters;

      const reading = {
        time: new Date().toISOString(),
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        distanceMeters: Math.round(d),
        withinAllowedRadius: within,
        accuracyOk,
      };

      setLastReading(reading);

      if (!accuracyOk) {
        setStatus(
          `Clock-in blocked: GPS accuracy too low (${reading.accuracy}m). Try again.`
        );
        return;
      }

      if (!within) {
        setStatus(
          `Clock-in blocked: outside ${WORKSITE.radiusMeters}m of ${WORKSITE.name} (${reading.distanceMeters}m away).`
        );
        return;
      }

      const punch = {
        id: crypto.randomUUID(),
        type: "IN",
        time: new Date().toISOString(),
        reading,
      };
      
      setPunches((prev) => [...prev, punch]);

      setStatus("Clocked in ✅ " + new Date().toLocaleTimeString());
    } catch (e) {
      setError(prettyGeoError(e));
      setStatus("Not clocked in");
    } finally {
      setBusy(false);
    }
  }

  function clockOut() {

    if (!isClockedIn) {
      setStatus("You are not clocked in yet.");
      return;
    }

    const punch = {
      id: crypto.randomUUID(),
      type: "OUT",
      time: new Date().toISOString(),
      reading: lastReading,
    };
    
    setPunches((prev) => [...prev, punch]);
    
    setStatus("Clocked out ✅ " + new Date().toLocaleTimeString());
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui", maxWidth: 820 }}>
      <h1>Dashboard</h1>

      <p style={{ opacity: 0.85 }}>
        Worksite: <b>{WORKSITE.name}</b> • Radius: <b>{WORKSITE.radiusMeters}m</b>{" "}
        • Max accuracy: <b>{WORKSITE.maxAccuracyMeters}m</b>
      </p>

     <div style={{ display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" }}>
  <button
  onClick={clockIn}
  disabled={
    busy ||
    isClockedIn ||
    (lastPunch?.type === "OUT" && !canClockInFromBreak)
  }
>
  {busy
    ? "Checking GPS…"
    : isClockedIn
    ? "Clocked In"
    : lastPunch?.type === "OUT" && !canClockInFromBreak
    ? `Break (${Math.ceil(breakRemainingMs / 60000)}m left)`
    : "Clock In (GPS)"}
</button>

  <button onClick={clockOut} disabled={busy || !isClockedIn}>
    Clock Out
  </button>

  <button onClick={resetDemo}>
    Reset Demo
  </button>
</div>
{lastPunch?.type === "OUT" && breakRemainingMs > 0 && (
  <p style={{ marginTop: 6, opacity: 0.85 }}>
    Break remaining: <b>{Math.ceil(breakRemainingMs / 60000)} min</b>
  </p>
)}

      <p>
        <b>Status:</b> {status}
      </p>

      {error && (
        <p style={{ color: "crimson" }}>
          <b>Error:</b> {error}
        </p>
      )}

      {lastReading && (
        <div style={{ marginTop: 14 }}>
          <h3>Last GPS Reading</h3>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 12,
              borderRadius: 10,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(lastReading, null, 2)}
          </pre>
        </div>
      )}
      <div style ={{ marginTop: 20 }}>
        <h3>Timesheet</h3>

        {sessions.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No completed sessions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: "6px" }}>In</th>
                <th style={{ padding: "6px" }}>Out</th>
                <th style={{ padding: "6px" }}>Hours</th>
              </tr>
            </thead>
            
            <tbody>
              {[...sessions].reverse().map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee"}}>
                  <td style={{ padding: "6px" }}>
                    {new Date(s.inTime).toLocaleString()}
                  </td>
                  <td style={{ padding: "6px" }}>
                    {new Date(s.outTime).toLocaleString()}
                  </td>
                  <td style={{ padding: "6px", fontWeight: 600 }}>
                    {s.hours.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Payroll</h3>
        
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label>
            Hourly Rate ($)
            <br />
            <input
              type="number"
              value={paySettings.hourlyRate}
              min="0"
              step="0.01"
              onChange={ (e) =>
                setPaySettings((prev) => ({
                  ...prev,
                  hourlyRate: e.target.value,
                }))
              }
              />
          </label>

          <label>
            Flat Rate ($)
            <br />
            <input
            type="number"
            value={paySettings.flatRate}
            min="0"
            step="0.01"
            onChange={ (e) =>
              setPaySettings((prev) => ({
                ...prev,
                flatRate: e.target.value,
              }))
            }
            />
          </label>
        </div>
        <p style={{ marginTop: 10}}>
          <b>Total Hours Worked:</b> {hoursWorked.toFixed(2)} hours
          <br />
          <b>Estimated Pay:</b> ${estimatedPay.toFixed(2)}
        </p>
      </div>
    </div>
  );
}