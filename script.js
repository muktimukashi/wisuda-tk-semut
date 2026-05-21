const welcomeOverlay = document.getElementById("welcomeOverlay");
const openInvitationBtn = document.getElementById("openInvitationBtn");
const bgMusic = document.getElementById("bgMusic");
const audioToggle = document.getElementById("audioToggle");
const audioIcon = document.getElementById("audioIcon");
const copyAgendaBtn = document.getElementById("copyAgendaBtn");
const shareBtn = document.getElementById("shareBtn");
const countdownNote = document.getElementById("countdownNote");

const eventDate = new Date("2026-06-13T09:00:00+07:00");
const invitationSummary = [
    "Perayaan Langkah Prestasiku",
    "Tema: Langkah Ceria Kenangan Bersama",
    "Tanggal: Sabtu, 13 Juni 2026",
    "Waktu: 09.00 - 11.30 WIB",
    "Dresscode Orang Tua: Batik",
    "Lokasi: Gedung Sekolah TK Semut"
].join("\n");

function setAudioState(isPlaying) {
    audioIcon.textContent = isPlaying ? "ON" : "OFF";
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
}

async function openInvitation() {
    welcomeOverlay.classList.add("hidden");
    welcomeOverlay.setAttribute("aria-hidden", "true");
    audioToggle.classList.remove("hidden");

    try {
        await bgMusic.play();
        setAudioState(true);
    } catch (error) {
        setAudioState(false);
    }
}

async function toggleAudio() {
    if (bgMusic.paused) {
        try {
            await bgMusic.play();
            setAudioState(true);
        } catch (error) {
            setAudioState(false);
        }
        return;
    }

    bgMusic.pause();
    setAudioState(false);
}

function updateCountdown() {
    const now = new Date();
    const diff = eventDate - now;

    if (diff <= 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        countdownNote.textContent = "Hari bahagia telah tiba. Sampai jumpa di acara.";
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
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
        window.setTimeout(() => {
            copyAgendaBtn.textContent = "Salin Detail";
        }, 1800);
    } catch (error) {
        copyAgendaBtn.textContent = "Gagal Menyalin";
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
audioToggle.addEventListener("click", toggleAudio);
copyAgendaBtn.addEventListener("click", copyInvitationDetails);
shareBtn.addEventListener("click", shareInvitation);

setAudioState(false);
setupReveal();
updateCountdown();
window.setInterval(updateCountdown, 1000);
