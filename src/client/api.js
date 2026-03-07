const API_BASE_URL = '/api';

// Obtener todas las cards (formato agrupado para el editor)
export const fetchAllCards = async () => {
  const response = await fetch(`${API_BASE_URL}/cards`);
  return await response.json();
};

// Obtener cards por categoría (para vistas normales)
export const fetchCardsByCategory = async (category) => {
  const response = await fetch(`${API_BASE_URL}/cards/category/${category}`);
  return await response.json();
};

// Obtener una card por ID
export const fetchCardById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/cards/${id}`);
  return await response.json();
};

// Agregar nueva card
export const addCard = async (cardData) => {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData)
  });
  return await response.json();
};

// Actualizar card (por categoría/índice - para editor actual)
export const updateCard = async (category, index, updates) => {
  const response = await fetch(`${API_BASE_URL}/cards/${category}/${index}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await response.json();
};

// Eliminar card (por categoría/índice - para editor actual)
export const deleteCard = async (category, index) => {
  const response = await fetch(`${API_BASE_URL}/cards/${category}/${index}`, {
    method: 'DELETE'
  });
  return await response.json();
};

// Actualizar card por ID (nuevo método)
export const updateCardById = async (id, updates) => {
  const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await response.json();
};

// Eliminar card por ID (nuevo método)
export const deleteCardById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};

// Mantener compatibilidad con código existente
export const getCards = fetchAllCards;