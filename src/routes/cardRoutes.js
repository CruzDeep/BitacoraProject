import express from 'express';
import {
  getAllCards,
  getCardsByCategory,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  updateCardById,
  deleteCardById
} from '../controllers/cardController.js';

const router = express.Router();

// Rutas para el editor (formato agrupado)
router.get('/cards', getAllCards);

// Rutas para las vistas normales
router.get('/cards/category/:category', getCardsByCategory);

// Rutas por ID (para futuras mejoras)
router.get('/cards/:id', getCardById);
router.put('/cards/:id', updateCardById);
router.delete('/cards/:id', deleteCardById);

// Rutas para el editor actual (por categoría/índice)
router.post('/cards', createCard);
router.put('/cards/:category/:index', updateCard);
router.delete('/cards/:category/:index', deleteCard);

export default router;