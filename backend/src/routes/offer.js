import express from "express";
import Offer from "../models/Offer.js"; // default import, note the .js extension

const router = express.Router();

// ✅ CREATE offer
// Accept single or multiple offers
router.post('/', async (req, res) => {
  try {
    const offers = Array.isArray(req.body) ? req.body : [req.body];
    const savedOffers = await Offer.insertMany(offers);
    res.status(201).json(savedOffers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ READ all offers
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ READ offers by role
router.get('/role/:role', async (req, res) => {
  try {
    const role = req.params.role;
    const offers = await Offer.find({ role });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE offer
router.put('/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE offer
router.delete('/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
