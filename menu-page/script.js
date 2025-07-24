const searchInput = document.getElementById("search");
const menuItems = document.querySelectorAll(".menu-item");
const categoryButtons = document.querySelectorAll("#category-buttons button");

searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  menuItems.forEach(item => {
    const name = item.querySelector("h3").textContent.toLowerCase();
    item.style.display = name.includes(searchValue) ? "flex" : "none";
  });
});

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.category;

    menuItems.forEach(item => {
      const itemCategory = item.dataset.category;
      item.style.display =
        selectedCategory === "all" || itemCategory === selectedCategory
          ? "flex"
          : "none";
    });

    searchInput.value = ""; // clear search when filtering
  });
});
