import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/luxeshop')
  .then(async () => {
    const result = await mongoose.connection.db.collection('products').updateMany(
      {},
      { $set: { isActive: true } }
    );
    console.log('Productos actualizados:', result.modifiedCount);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
