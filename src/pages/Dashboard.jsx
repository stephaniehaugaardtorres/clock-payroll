import { useState } from "react";
export default function Dashboard() {
    const [status, setStatus] = useState("Not clocked in");
    function clockIn() {
        setStatus("Clocked in at " + new Date().toLocaleTimeString());
    }
    function clockOut() {
        setStatus("Clocked out at " + new Date ().toLocaleTimeString());
    }
    return (
        <div style={{padding: 20, fontFamily: "system-ui"}}>
            <h1>Dashboard</h1>
            <div style={{ display: "flex", gap: 10, marginBottom: 15}}>
                <button onClick={clockIn}>Clock In</button>
                <button onClick={clockOut}>Clock Out</button>
            </div>
            <p><b>Status:</b>{status}</p>
        </div>
    );
}