import { Card } from '../models/index.js';

// Obtener todas las cards (agrupadas por categoría)
export const getAllCards = async (req, res) => {
  try {
    const cards = await Card.find();
    
    // Agrupar por categoría
    const grouped = {};
    cards.forEach(card => {
      if (!grouped[card.category]) {
        grouped[card.category] = [];
      }
      grouped[card.category].push({
        title: card.title,
        desc: card.desc,
        command: card.command,
        args: card.args || []
      });
    });
    
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener cards por categoría
export const getCardsByCategory = async (req, res) => {
  try {
    const cards = await Card.find({ category: req.params.category });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una card por ID
export const getCardById = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card no encontrada' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nueva card
export const createCard = async (req, res) => {
  try {
    const { category, title, desc, command } = req.body;
    
    if (!category || !title || !desc || !command) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const newCard = new Card({
      title,
      desc,
      command,
      args: [],
      category
    });

    const savedCard = await newCard.save();
    res.status(201).json({ 
      message: `Card agregada en ${category}`,
      card: savedCard 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔹 ACTUALIZADO: Ahora maneja cambio de categoría
export const updateCard = async (req, res) => {
  try {
    const { category, index } = req.params;
    const { title, desc, command, category: newCategory } = req.body;

    // Buscar todas las cards de la categoría ORIGINAL
    const cards = await Card.find({ category }).sort({ _id: 1 });
    
    if (!cards[index]) {
      return res.status(404).json({ message: "Card no encontrada" });
    }

    // Si la categoría cambió
    if (newCategory && newCategory !== category) {
      // Obtener la card a mover
      const cardToMove = cards[index];
      
      // Crear NUEVA card en la nueva categoría
      const newCard = new Card({
        title: title || cardToMove.title,
        desc: desc || cardToMove.desc,
        command: command || cardToMove.command,
        args: cardToMove.args || [],
        category: newCategory
      });
      
      // Guardar la nueva card
      await newCard.save();
      
      // Eliminar la card original
      await Card.findByIdAndDelete(cardToMove._id);
      
      return res.json({ 
        message: `Card movida de "${category}" a "${newCategory}" correctamente` 
      });
    } else {
      // Misma categoría - solo actualizar campos
      const cardToUpdate = cards[index];
      cardToUpdate.title = title || cardToUpdate.title;
      cardToUpdate.desc = desc || cardToUpdate.desc;
      cardToUpdate.command = command || cardToUpdate.command;
      
      await cardToUpdate.save();
      
      return res.json({ message: "Card actualizada correctamente" });
    }
  } catch (error) {
    console.error("Error en updateCard:", error);
    res.status(400).json({ message: error.message });
  }
};

// Eliminar card (por categoría/índice)
export const deleteCard = async (req, res) => {
  try {
    const { category, index } = req.params;

    // Buscar todas las cards de esa categoría
    const cards = await Card.find({ category }).sort({ _id: 1 });
    
    if (!cards[index]) {
      return res.status(404).json({ message: "Card no encontrada" });
    }

    // Eliminar la card en ese índice
    await Card.findByIdAndDelete(cards[index]._id);

    res.json({ message: "Card eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar card por ID (nuevo método)
export const updateCardById = async (req, res) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCard) {
      return res.status(404).json({ message: 'Card no encontrada' });
    }
    
    res.json({ message: "Card actualizada correctamente", card: updatedCard });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar card por ID
export const deleteCardById = async (req, res) => {
  try {
    const deletedCard = await Card.findByIdAndDelete(req.params.id);
    
    if (!deletedCard) {
      return res.status(404).json({ message: 'Card no encontrada' });
    }
    
    res.json({ message: "Card eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};