function deviceIsMobile() { return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1); }

function viewportIsPortrait() { return (window.innerWidth / window.innerHeight) < 1; }