const API_URL = "/api/cards";
const messageDiv = document.getElementById("message");
const listContainer = document.getElementById("cards-list");

// --- Cargar todas las cards ---
async function loadCards() {
  listContainer.innerHTML = "<p class='muted'>Cargando...</p>";
  const res = await fetch(API_URL);
  const data = await res.json();

  listContainer.innerHTML = "";
  Object.entries(data).forEach(([category, cards]) => {
    const catTitle = document.createElement("h2");
    catTitle.textContent = category.toUpperCase();
    listContainer.appendChild(catTitle);

    cards.forEach((card, index) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <strong>${card.title}</strong>
        <p class="desc">${card.desc}</p>
        <div class="code">${card.command}</div>
        <div class="actions">
          <button class="btn small edit">✏️ Editar</button>
          <button class="btn small delete">🗑️ Eliminar</button>
        </div>
      `;

      // --- Eliminar card ---
      div.querySelector(".delete").onclick = async () => {
        if (confirm(`¿Eliminar "${card.title}"?`)) {
          await fetch(`${API_URL}/${category}/${index}`, { method: "DELETE" });
          showMessage("✅ Card eliminada correctamente");
          loadCards();
        }
      };

      // --- Editar card ---
      div.querySelector(".edit").onclick = () => {
        document.getElementById("category").value = category;
        document.getElementById("title").value = card.title;
        document.getElementById("desc").value = card.desc;
        document.getElementById("command").value = card.command;
        document.getElementById("form-card").dataset.editing = `${category}/${index}`;
        document.querySelector(".add").textContent = "Actualizar";
        document.getElementById("cancel-edit").style.display = "inline-block";
      };

      listContainer.appendChild(div);
    });
  });
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

  const editPath = e.target.dataset.editing;
  const method = editPath ? "PUT" : "POST";
  const url = editPath ? `${API_URL}/${editPath}` : API_URL;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

  const result = await res.json();
  showMessage(result.message);

  e.target.reset();
  delete e.target.dataset.editing;
  document.querySelector(".add").textContent = "Agregar";
  document.getElementById("cancel-edit").style.display = "none";
  loadCards();
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
