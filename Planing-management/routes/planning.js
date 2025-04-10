const express = require('express');
const router = express.Router();
const Planning = require('../models/Planning');

// Create
router.post('/', async (req, res) => {
    const planning = new Planning(req.body);
    await planning.save();
    res.send(planning);
});

// Read All
router.get('/', async (req, res) => {
    const planning = await Planning.find();
    res.send(planning);
});

// Read One
router.get('/:id', async (req, res) => {
    const planning = await Planning.findById(req.params.id);
    res.send(planning);
});

// Update
router.put('/:id', async (req, res) => {
    const planning = await Planning.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(planning);
});

// Delete
router.delete('/:id', async (req, res) => {
    await Planning.findByIdAndDelete(req.params.id);
    res.send({ message: 'Planning supprimé' });
});

module.exports = router;