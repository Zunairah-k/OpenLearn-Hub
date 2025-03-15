document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("show"); // Toggle 'show' class to open/close menu
    });
});

/*document.querySelector(".menu-toggle").addEventListener("click", function() {
    document.querySelector("nav ul").classList.toggle("show");
});*/
