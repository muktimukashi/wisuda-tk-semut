const welcomeOverlay = document.getElementById("welcomeOverlay");
const openInvitationBtn = document.getElementById("openInvitationBtn");
const bgMusic = document.getElementById("bgMusic");
const sunWidget = document.getElementById("sunWidget");
const copyAgendaBtn = document.getElementById("copyAgendaBtn");
const shareBtn = document.getElementById("shareBtn");
const countdownNote = document.getElementById("countdownNote");

const countdownFields = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};

const eventDate = new Date("2026-06-13T09:00:00+07:00");
const invitationSummary = [
    "Perayaan Langkah Prestasiku",
    "Tema: Langkah Ceria Kenangan Bersama",
    "Tanggal: Sabtu, 13 Juni 2026",
    "Waktu: 09.00 - 11.30 WIB",
    "Dresscode Orang Tua: Batik",
    "Lokasi: KB Semut-Semut the Natural School"
].join("\n");

let musicFadeTimer = null;

function setCountdownText(days, hours, minutes, seconds) {
    countdownFields.days.textContent = days;
    countdownFields.hours.textContent = hours;
    countdownFields.minutes.textContent = minutes;
    countdownFields.seconds.textContent = seconds;
}

function setSunState(isSunny) {
    document.body.classList.toggle("sunny", isSunny);
    sunWidget.setAttribute("aria-pressed", String(isSunny));
    sunWidget.querySelector(".sun-label").textContent = isSunny ? "Musik ON" : "Musik OFF";
}

function fadeAudio(targetVolume, duration = 1200) {
    window.clearInterval(musicFadeTimer);

    const startVolume = bgMusic.volume;
    const volumeDelta = targetVolume - startVolume;
    const startedAt = performance.now();

    musicFadeTimer = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const progress = Math.min(elapsed / duration, 1);
        bgMusic.volume = Math.max(0, Math.min(1, startVolume + volumeDelta * progress));

        if (progress >= 1) {
            window.clearInterval(musicFadeTimer);
            musicFadeTimer = null;
        }
    }, 50);
}

async function startMusic() {
    bgMusic.volume = 0;

    try {
        await bgMusic.play();
        fadeAudio(1);
    } catch {
        return;
    }
}

async function toggleSun() {
    const nextState = !document.body.classList.contains("sunny");
    setSunState(nextState);

    if (nextState && bgMusic.paused) {
        await startMusic();
    } else if (!nextState && !bgMusic.paused) {
        fadeAudio(0, 500);
        window.setTimeout(() => bgMusic.pause(), 520);
    }
}

async function openInvitation() {
    welcomeOverlay.classList.add("hidden");
    welcomeOverlay.setAttribute("aria-hidden", "true");

    setSunState(true);
    await startMusic();
}

function updateCountdown() {
    const now = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
        setCountdownText("00", "00", "00", "00");
        countdownNote.textContent = "Hari bahagia telah tiba. Sampai jumpa di acara.";
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setCountdownText(
        String(days).padStart(2, "0"),
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
    );
}

function setupReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    revealElements.forEach((element) => observer.observe(element));
}

async function copyInvitationDetails() {
    try {
        await navigator.clipboard.writeText(invitationSummary);
        copyAgendaBtn.textContent = "Tersalin";
    } catch {
        copyAgendaBtn.textContent = "Gagal Menyalin";
    } finally {
        window.setTimeout(() => {
            copyAgendaBtn.textContent = "Salin Detail";
        }, 1800);
    }
}

async function shareInvitation() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: "Perayaan Langkah Prestasiku",
                text: invitationSummary,
                url: window.location.href
            });
            return;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }
        }
    }

    await copyInvitationDetails();
}

openInvitationBtn.addEventListener("click", openInvitation);
sunWidget.addEventListener("click", toggleSun);
copyAgendaBtn.addEventListener("click", copyInvitationDetails);
shareBtn.addEventListener("click", shareInvitation);

setSunState(false);
setupReveal();
updateCountdown();
window.setInterval(updateCountdown, 1000);
