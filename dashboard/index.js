var sideMenu = document.querySelector("aside");
var menuBtn = document.querySelector("#menu-btn");
var closeBtn = document.querySelector("#close-btn");
//show menu
menuBtn.addEventListener("click", function () {
  sideMenu.style.display = "block";
});
//hide menu
closeBtn.addEventListener("click", function () {
  sideMenu.style.display = "none";
});

// Dark them and light theme
var themeToggler = document.querySelector(".theme-toggler");
themeToggler.addEventListener("click", function () {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
});

//sideNavbar

const sidebarLinks = document.querySelectorAll(".sidebar a");
const sections = document.querySelectorAll("main > div");

// Add event listeners to each link
sidebarLinks.forEach((link) => {
  link.addEventListener("click", function () {
    // Remove the 'active' class from all links
    sidebarLinks.forEach((link) => link.classList.remove("active"));

    // Add the 'active' class to the clicked link
    this.classList.add("active");

    // Hide all sections
    sections.forEach((section) => (section.style.display = "none"));

    // Get the link text and convert it to lower case to match the section IDs
    const selectedPage = this.querySelector("h3")
      .innerText.toLowerCase()
      .replace(" ", "");

    // Show the corresponding section by ID
    const selectedSection = document.getElementById(`${selectedPage}-section`);
    if (selectedSection) {
      selectedSection.style.display = "block";
    }
  });
});

const addProductButton = document.querySelector(".add-product");
const addProductSection = document.getElementById("addproduct-section"); // Your add product form section

addProductButton.addEventListener("click", () => {
  // Hide other sections and show the Add Product section
  document.querySelectorAll("main > div").forEach((section) => {
    section.style.display = "none";
  });
  addProductSection.style.display = "block";

  // Remove the active class from all links
  sidebarLinks.forEach((link) => link.classList.remove("active"));

  // Add the active class to the specific link for "Add Product"
  const addProductLink = [...sidebarLinks].find(
    (link) => link.querySelector("h3").innerText.toLowerCase() === "add product"
  );

  if (addProductLink) {
    addProductLink.classList.add("active");
  }
});
