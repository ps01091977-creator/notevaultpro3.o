const express = require('express');
const router = express.Router();
const foldersController = require('../controllers/foldersController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(foldersController.getFolders)
  .post(protect, admin, foldersController.createFolder);

router.route('/:id')
  .delete(protect, admin, foldersController.deleteFolder);

module.exports = router;
