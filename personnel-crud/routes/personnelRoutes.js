const express = require('express');
const router = express.Router();
const {
    createPersonnel,
    getAllPersonnel,
    getPersonnelById,
    updatePersonnel,
    deletePersonnel,
    getAllShifts
} = require('../controllers/personnelController');

router.get('/shifts', getAllShifts);
router.post('/', createPersonnel);
router.get('/', getAllPersonnel);
router.get('/:id', getPersonnelById);
router.put('/:id', updatePersonnel);
router.delete('/:id', deletePersonnel);

module.exports = router; // ✅ à ne pas oublier
