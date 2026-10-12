const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'documents.json');

let useMongo = false;

// In-memory + File Fallback Database implementation supporting separate normal and sticky spaces
class FallbackStore {
  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
      }
    } catch (err) {
      console.warn('Could not create data dir, fallback store might be read-only:', err.message);
    }
  }

  loadData() {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw || '{}');
    } catch (err) {
      console.error('Error loading fallback JSON store:', err);
      return {};
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('Error saving fallback JSON store (might be read-only env):', err.message);
    }
  }

  getStoreKey(key, mode = 'normal') {
    const normKey = String(key).trim().toLowerCase();
    const normMode = mode === 'sticky' ? 'sticky' : 'normal';
    return `${normMode}:${normKey}`;
  }

  get(key, mode = 'normal') {
    const storeKey = this.getStoreKey(key, mode);
    return this.data[storeKey] || null;
  }

  set(key, mode = 'normal', content, isSticky) {
    const normKey = String(key).trim().toLowerCase();
    const normMode = mode === 'sticky' ? 'sticky' : 'normal';
    const storeKey = `${normMode}:${normKey}`;
    const existing = this.data[storeKey];

    // Block any modification to an already-stuck document (user cannot edit or update)
    if (existing && existing.isSticky) {
      throw new Error('Document is permanently sticky and read-only');
    }

    const doc = {
      key: normKey,
      mode: normMode,
      content: content ?? (existing ? existing.content : ''),
      isSticky: Boolean(isSticky || (existing && existing.isSticky)),
      updatedAt: new Date().toISOString()
    };

    this.data[storeKey] = doc;
    this.saveData();
    return doc;
  }
}

const fallbackStore = new FallbackStore();

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('No MONGODB_URI configured. Using local JSON store fallback.');
    useMongo = false;
    return;
  }
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    useMongo = true;
    console.log('Successfully connected to MongoDB database.');
  } catch (err) {
    console.warn('MongoDB connection failed. Using local JSON store fallback:', err.message);
    useMongo = false;
  }
};

const getIsMongoConnected = () => useMongo;

module.exports = {
  connectDB,
  getIsMongoConnected,
  fallbackStore
};
