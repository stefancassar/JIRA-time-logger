const express = require('express');
const router = express.Router();

// Require the controllers
const worklog_controller = require('../controllers/worklog.controller');


// a simple test url to check that all of our files are communicating correctly.
router.get('/test', worklog_controller.test);


router.post('/create', worklog_controller.worklog_create);
// router.get('/:id', product_controller.product_details);
// router.put('/:id/update', product_controller.product_update);
// router.delete('/:id/delete', product_controller.product_delete);
module.exports = router;