const express = require('express');
const router = express.Router();
const {
    createPersonnel,
    getAllPersonnel,
    getPersonnelById,
    updatePersonnel,
    deletePersonnel,
    getAllShifts // ✅ Ajout de la nouvelle fonction ici
} = require('../controllers/personnelController');

router.post('/', createPersonnel);
router.get('/', getAllPersonnel);
router.get('/:id', getPersonnelById);
router.put('/:id', updatePersonnel);
router.delete('/:id', deletePersonnel);
router.get('/shifts', getAllShifts); // ✅ Nouvelle route

module.exports = router;
