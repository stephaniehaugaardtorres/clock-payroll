export function calculateWorkTime(punches) {
    let totalMs = 0;
    let lastIn = null;

    for (const punch of punches) {
        if (punch.type === "IN") {
            lastIn = new Date(punch.time);
        }
        
        if (punch.type === "OUT" && lastIn) {
            const end = new Date(punch.time);
            totalMs += end - lastIn;
            lastIn = null;
        }
    }

    const hours = totalMs / (1000 * 60 * 60);

    return {
        hoursWorked: hours,
    };
}

export function buildSessions(punches) {
    const sessions = [];
    let lastIn = null;

    for(const p of punches) {
        if (p.type === "IN") {
            lastIn = p;
        }

        if(p.type === "OUT" && lastIn) {
            const start = new Date(lastIn.time);
            const end = new Date(p.time);

            const hours = (end - start) / (1000 * 60 * 60);

            sessions.push({
                inTime: lastIn.time,
                outTime: p.time,
                hours,
            });
            
            lastIn = null;
        }
    }

    return sessions;
}