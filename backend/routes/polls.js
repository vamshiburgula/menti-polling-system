const express = require('express');
const router = express.Router();
const pollCtrl = require('../controllers/pollController');
router.post('/', pollCtrl.createPoll);
router.get('/:id', pollCtrl.getPoll);
router.post('/:id/end', pollCtrl.endPoll);
router.get('/', pollCtrl.listPolls);
module.exports = router;
