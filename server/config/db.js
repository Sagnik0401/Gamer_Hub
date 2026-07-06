const mongoose = require('mongoose');
const dns = require('dns');

// Local DNS server fails to resolve MongoDB Atlas SRV records.
// Override to use Google Public DNS which resolves them correctly.
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

module.exports = connectDB;
