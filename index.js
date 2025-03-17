/*document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("show"); // Toggle 'show' class to open/close menu
    });
});

/*document.querySelector(".menu-toggle").addEventListener("click", function() {
    document.querySelector("nav ul").classList.toggle("show");
});*/
/*document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    function toggleMenu() {
        if (window.innerWidth <= 768) { // Enable toggle only for small screens
            navLinks.classList.toggle("show");
        }
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", toggleMenu);
    }

    // Close menu when resizing to a large screen
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            navLinks.classList.remove("show");
        }
    });
});*/
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("nav ul");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("show"); // Toggle the 'show' class on click
    });

    // Optional: Close menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!menuToggle.contains(event.target) && !nav.contains(event.target)) {
            nav.classList.remove("show"); // Close menu if clicked outside
        }
    });
});