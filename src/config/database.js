import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4 // 👈 Esta línea fuerza IPv4
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
};

export default connectDB;