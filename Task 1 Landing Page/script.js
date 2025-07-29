// Navbar scroll effect
window.addEventListener("scroll", function() {
    const header = document.querySelector("header");
    header.style.background = window.scrollY > 50 ? "rgba(0,0,0,0.8)" : "rgba(20, 20, 20, 0.5)";
});

// Reveal sections on scroll
const sections = document.querySelectorAll("section");
window.addEventListener("scroll", () => {
    const triggerBottom = window.innerHeight * 0.85;
    sections.forEach(sec => {
        const sectionTop = sec.getBoundingClientRect().top;
        if (sectionTop < triggerBottom) {
            sec.classList.add("show");
        }
    });
});
