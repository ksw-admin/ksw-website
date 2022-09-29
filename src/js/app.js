//Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js", {
      scope: ".", // <--- THIS BIT IS REQUIRED
    })
    .then(
      function (registration) {
        // Registration was successful
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
}
//Navbar
const hamburger = document.querySelector(".Hamburger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links li");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  document.body.classList.toggle("scroll-lock");
});

// Loading animation
let loader = document.querySelector(".loader");

window.addEventListener("load", function () {
  // spinnerWrapper.style.display = 'none';
  loader.parentElement.removeChild(loader);
});
//Netlify CMS
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", (user) => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}
