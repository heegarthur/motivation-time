const stopwatchClock = document.getElementById('stopwatch-clock');
const countdownClock = document.getElementById('countdown-clock');

const swCtx = stopwatchClock.getContext('2d');
const cdCtx = countdownClock.getContext('2d');

const swDisplay = document.getElementById('stopwatch-display');
const cdDisplay = document.getElementById('countdown-display');

const swStartBtn = document.getElementById('stopwatch-start');
const swStopBtn = document.getElementById('stopwatch-stop');
const swResetBtn = document.getElementById('stopwatch-reset');

const cdStartBtn = document.getElementById('countdown-start');
const cdStopBtn = document.getElementById('countdown-stop');
const cdResetBtn = document.getElementById('countdown-reset');

const cdInput = document.getElementById('countdown-input');

const swEncouragement = document.getElementById('stopwatch-encouragement');
const cdEncouragement = document.getElementById('countdown-encouragement');

const quotesInput = document.getElementById('quotes-input');
const saveQuotesBtn = document.getElementById('save-quotes');

let encouragementQuotes = quotesInput.value
    .split('!')
    .map(q => q.trim())
    .filter(Boolean)
    .map(q => q + '!');

saveQuotesBtn.addEventListener('click', () => {
    encouragementQuotes = quotesInput.value
        .split('!')
        .map(q => q.trim())
        .filter(Boolean)
        .map(q => q + '!');
    alert('Encouragements saved!');
});

// Disco effect toggling helper
function toggleDisco(element, enable) {
    if (enable) element.classList.add('disco');
    else element.classList.remove('disco');
}

// ANALOG CLOCK DRAWING
function drawClock(ctx, seconds) {
    const radius = ctx.canvas.width / (2 * (window.devicePixelRatio || 1));

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(radius, radius);

    // Draw outer circle
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#777';
    ctx.fillStyle = '#111';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;
    ctx.arc(0, 0, radius - 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw ticks every 5 seconds (12 ticks)
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#444';
    for (let i = 0; i < 60; i += 5) {
        ctx.beginPath();
        let angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
        let inner = radius - 20;
        let outer = radius - 10;
        ctx.moveTo(inner * Math.cos(angle), inner * Math.sin(angle));
        ctx.lineTo(outer * Math.cos(angle), outer * Math.sin(angle));
        ctx.stroke();
    }

    // Draw second hand
    ctx.beginPath();
    let angle = (seconds / 60) * 2 * Math.PI - Math.PI / 2;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0af';
    ctx.shadowColor = '#0af';
    ctx.shadowBlur = 10;
    ctx.moveTo(0, 0);
    ctx.lineTo(
        (radius - 40) * Math.cos(angle),
        (radius - 40) * Math.sin(angle)
    );
    ctx.stroke();

    // Draw center dot
    ctx.beginPath();
    ctx.fillStyle = '#0af';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#0af';
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

// STOPWATCH LOGIC
let swStartTime = 0;
let swElapsed = 0;
let swTimerId = null;

function formatStopwatchTime(ms) {
    let totalSeconds = ms / 1000;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    let centiseconds = Math.floor((ms % 1000) / 10);
    return (
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds + '.' +
        (centiseconds < 10 ? '0' : '') + centiseconds
    );
}

function updateStopwatch() {
    let now = Date.now();
    swElapsed = now - swStartTime;
    swDisplay.textContent = formatStopwatchTime(swElapsed);

    let seconds = (swElapsed / 1000) % 60;
    drawClock(swCtx, seconds);

    // Encouragement every 10 seconds while running
    if (Math.floor(seconds) % 10 === 0 && swElapsed > 0) {
        let quote = encouragementQuotes[Math.floor(Math.random() * encouragementQuotes.length)];
        swEncouragement.textContent = quote;
        toggleDisco(swEncouragement, true);
    } else {
        toggleDisco(swEncouragement, false);
    }

    swTimerId = requestAnimationFrame(updateStopwatch);
}

swStartBtn.addEventListener('click', () => {
    swStartTime = Date.now() - swElapsed;
    swStartBtn.disabled = true;
    swStopBtn.disabled = false;
    swResetBtn.disabled = false;
    updateStopwatch();
});

swStopBtn.addEventListener('click', () => {
    cancelAnimationFrame(swTimerId);
    swTimerId = null;
    swElapsed = Date.now() - swStartTime;
    swStartBtn.disabled = false;
    swStopBtn.disabled = true;
    swResetBtn.disabled = false;
    swEncouragement.textContent = '';
    toggleDisco(swEncouragement, false);
});

swResetBtn.addEventListener('click', () => {
    cancelAnimationFrame(swTimerId);
    swTimerId = null;
    swElapsed = 0;
    swDisplay.textContent = '00:00.00';
    drawClock(swCtx, 0);
    swStartBtn.disabled = false;
    swStopBtn.disabled = true;
    swResetBtn.disabled = true;
    swEncouragement.textContent = '';
    toggleDisco(swEncouragement, false);
});

// COUNTDOWN LOGIC
let cdDuration = 30; // seconds
let cdRemaining = cdDuration;
let cdTimerId = null;

function formatCountdownTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function updateCountdown() {
    const now = Date.now();
    const elapsed = (now - cdStartTime) / 1000;
    cdRemaining = Math.max(0, cdTotalDuration - elapsed);

    cdDisplay.textContent = formatCountdownTime(cdRemaining);
    drawClock(cdCtx, cdRemaining % 60);

    if (Math.floor(cdRemaining) % 10 === 0 && cdRemaining > 0) {
        let quote = encouragementQuotes[Math.floor(Math.random() * encouragementQuotes.length)];
        cdEncouragement.textContent = quote;
        toggleDisco(cdEncouragement, true);
    } else {
        toggleDisco(cdEncouragement, false);
    }

    if (cdRemaining <= 0) {
        cdDisplay.textContent = '00:00';
        cdEncouragement.textContent = 'Done! Well done!';
        toggleDisco(cdEncouragement, true);
        cdStartBtn.disabled = false;
        cdStopBtn.disabled = true;
        return;
    }

    cdTimerId = requestAnimationFrame(updateCountdown);
}

cdStartBtn.addEventListener('click', () => {
    const inputVal = parseInt(cdInput.value, 10);
    if (isNaN(inputVal) || inputVal <= 0) {
        alert('Enter a valid number of seconds');
        return;
    }

    cdTotalDuration = inputVal;
    cdRemaining = cdTotalDuration;
    cdStartTime = Date.now();

    cdStartBtn.disabled = true;
    cdStopBtn.disabled = false;
    cdResetBtn.disabled = false;

    updateCountdown();
});

cdStopBtn.addEventListener('click', () => {
    cancelAnimationFrame(cdTimerId);
    cdTimerId = null;
    cdStartBtn.disabled = false;
    cdStopBtn.disabled = true;
    cdResetBtn.disabled = false;
    cdEncouragement.textContent = '';
    toggleDisco(cdEncouragement, false);
});

cdResetBtn.addEventListener('click', () => {
    cancelAnimationFrame(cdTimerId);
    cdTimerId = null;
    cdRemaining = cdDuration;
    cdDisplay.textContent = formatCountdownTime(cdRemaining);
    drawClock(cdCtx, cdRemaining % 60);
    cdStartBtn.disabled = false;
    cdStopBtn.disabled = true;
    cdResetBtn.disabled = true;
    cdEncouragement.textContent = '';
    toggleDisco(cdEncouragement, false);
});

// Initial draw
drawClock(swCtx, 0);
drawClock(cdCtx, cdInput.value % 60);

function setupCanvas(canvas, ctx, size = 180) {
    const ratio = window.devicePixelRatio || 1;

    canvas.width = size * ratio;
    canvas.height = size * ratio;

    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

setupCanvas(stopwatchClock, swCtx);
setupCanvas(countdownClock, cdCtx);
