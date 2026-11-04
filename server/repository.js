import mongoose from 'mongoose';
import { defaultPortfolio } from '../shared/portfolio.js';
export async function createRepository(uri) {
  if (!uri) return { mode: 'defaults', getPortfolio: async () => ({ ...defaultPortfolio }), healthy: () => true, close: async () => {} };
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  const text = { type: String, required: true, trim: true, maxlength: 160 };
  const Portfolio = connection.model('Portfolio', new mongoose.Schema({ _id: String, firstName: text, lastName: text, subtitle: text }, { timestamps: true }));
  return {
    mode: 'mongodb', healthy: () => connection.readyState === 1,
    async getPortfolio() {
      const record = await Portfolio.findById('portfolio').lean();
      return record ? { firstName: record.firstName, lastName: record.lastName, subtitle: record.subtitle } : { ...defaultPortfolio };
    },
    async seed() { await Portfolio.updateOne({ _id: 'portfolio' }, { $setOnInsert: { ...defaultPortfolio } }, { upsert: true, runValidators: true }); },
    close: () => connection.close(),
  };
}
