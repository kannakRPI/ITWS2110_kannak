document.addEventListener("DOMContentLoaded", function() {
    const menuGrid = document.getElementById("menuGrid");
  
    fetch("data/menu.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        data.forEach(dish => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <div class="card-content">
              <h3>${dish.name}</h3>
              <p>${dish.description}</p>
              <p class="meta">${dish.category} • ${dish.cuisine}</p>
              <p class="price">${dish.price}</p>
            </div>
          `;
          menuGrid.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Error fetching menu data:", error);
        menuGrid.innerHTML = `<p style="text-align:center; color:red;">⚠️ Unable to load menu data.</p>`;
      });
  });
  