const API_URL = "/api/cards";
const messageDiv = document.getElementById("message");
const listContainer = document.getElementById("cards-list");

// --- NUEVA FUNCIÓN: Cargar categorías para el select ---
async function loadCategories() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    
    // Obtener categorías únicas de los datos
    const categories = Object.keys(data);
    
    // Actualizar el select
    const select = document.getElementById('category');
    if (select) {
      // Guardar el valor actual si hay uno (para cuando se edita)
      const currentValue = select.value;
      
      // Limpiar opciones existentes (excepto la primera)
      select.innerHTML = '<option value="">Selecciona una categoría...</option>';
      
      // Agregar las categorías ordenadas alfabéticamente
      categories.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        // Capitalizar primera letra
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(option);
      });
      
      // Restaurar valor si existía (útil cuando se edita)
      if (currentValue) select.value = currentValue;
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// --- Cargar todas las cards (MODIFICADA para incluir loadCategories) ---
async function loadCards() {
  listContainer.innerHTML = "<p class='muted'>Cargando...</p>";
  
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    listContainer.innerHTML = "";
    
    // 🔹 NUEVO: Cargar categorías en el select antes de mostrar las cards
    await loadCategories();
    
    // Recorrer cada categoría
    Object.entries(data).forEach(([category, cards]) => {
      const catTitle = document.createElement("h2");
      catTitle.textContent = category.toUpperCase();
      listContainer.appendChild(catTitle);

      // Recorrer cada card de la categoría
      cards.forEach((card, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <strong>${card.title}</strong>
          <p class="desc">${card.desc}</p>
          <div class="code">${card.command}</div>
          <div class="actions">
            <button class="btn small edit" data-category="${category}" data-index="${index}">✏️ Editar</button>
            <button class="btn small delete" data-category="${category}" data-index="${index}">🗑️ Eliminar</button>
          </div>
        `;

        listContainer.appendChild(div);
      });
    });

    // Agregar event listeners DESPUÉS de crear los elementos
    document.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const category = e.target.dataset.category;
        const index = e.target.dataset.index;
        
        if (confirm(`¿Eliminar esta card?`)) {
          const res = await fetch(`${API_URL}/${category}/${index}`, { 
            method: "DELETE" 
          });
          const result = await res.json();
          showMessage(result.message || "✅ Card eliminada");
          loadCards(); // Recargar la lista
        }
      });
    });

    document.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const category = e.target.dataset.category;
        const index = e.target.dataset.index;
        const cardDiv = e.target.closest(".card");
        const title = cardDiv.querySelector("strong").textContent;
        const desc = cardDiv.querySelector(".desc").textContent;
        const command = cardDiv.querySelector(".code").textContent;

        document.getElementById("category").value = category;
        document.getElementById("title").value = title;
        document.getElementById("desc").value = desc;
        document.getElementById("command").value = command;
        document.getElementById("form-card").dataset.editing = `${category}/${index}`;
        document.querySelector(".add").textContent = "Actualizar";
        document.getElementById("cancel-edit").style.display = "inline-block";
      });
    });
    
  } catch (error) {
    console.error('Error cargando cards:', error);
    listContainer.innerHTML = "<p class='error'>Error al cargar las cards</p>";
  }
}

// --- Agregar o editar una card ---
document.getElementById("form-card").addEventListener("submit", async (e) => {
  e.preventDefault();

  const card = {
    category: document.getElementById("category").value.trim(),
    title: document.getElementById("title").value.trim(),
    desc: document.getElementById("desc").value.trim(),
    command: document.getElementById("command").value.trim(),
  };

  // Validar que se haya seleccionado una categoría
  if (!card.category) {
    showMessage("❌ Debes seleccionar una categoría");
    return;
  }

  const editPath = e.target.dataset.editing;
  
  let res;
  if (editPath) {
    // Es una edición
    res = await fetch(`${API_URL}/${editPath}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
  } else {
    // Es una nueva card
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
  }

  const result = await res.json();
  showMessage(result.message || "✅ Operación exitosa");

  e.target.reset();
  delete e.target.dataset.editing;
  document.querySelector(".add").textContent = "Agregar";
  document.getElementById("cancel-edit").style.display = "none";
  loadCards(); // Recargar la lista (también recargará las categorías)
});

// --- Cancelar edición ---
document.getElementById("cancel-edit").addEventListener("click", (e) => {
  e.preventDefault();
  const form = document.getElementById("form-card");
  form.reset();
  delete form.dataset.editing;
  document.querySelector(".add").textContent = "Agregar";
  e.target.style.display = "none";
  showMessage("Edición cancelada");
});

// --- Mostrar mensajes temporales ---
function showMessage(msg) {
  messageDiv.textContent = msg;
  messageDiv.style.opacity = "1";
  setTimeout(() => (messageDiv.style.opacity = "0"), 2500);
}

// --- Cargar las cards al iniciar ---
loadCards();