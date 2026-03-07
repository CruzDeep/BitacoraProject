import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Card } from '../src/models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrateData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const cardsData = await fs.readFile(
      path.join(__dirname, '../data/cards.json'),
      'utf-8'
    );
    const categoriesData = JSON.parse(cardsData);
    
    const allCards = [];
    for (const [category, cards] of Object.entries(categoriesData)) {
      const cardsWithCategory = cards.map(card => ({
        ...card,
        category: category
      }));
      allCards.push(...cardsWithCategory);
    }

    await Card.deleteMany({});
    console.log('🗑️ Colección limpiada');

    const result = await Card.insertMany(allCards);
    console.log(`✅ ${result.length} cards migradas`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

migrateData();