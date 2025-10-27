export async function getCards() {
  const res = await fetch("/api/cards");
  return await res.json();
}

export async function addCard(card) {
  const res = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
  return await res.json();
}

export async function updateCard(id, updates) {
  const res = await fetch(`/api/cards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return await res.json();
}

export async function deleteCard(id) {
  const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
  return await res.json();
}
