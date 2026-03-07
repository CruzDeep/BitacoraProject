import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  desc: { 
    type: String, 
    required: true 
  },
  command: { 
    type: String, 
    required: true 
  },
  args: { 
    type: [String], 
    default: [] 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['system', 'security', 'network', 'gpo', 'firewall', 'ad', 'logs']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Card = mongoose.model('Card', cardSchema);
export default Card;