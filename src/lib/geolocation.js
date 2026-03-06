export function getCurrentPosition(options = {}) {
    const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
    };
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(new Error("Geolocation is not supported in this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, defaultOptions);
    });
}