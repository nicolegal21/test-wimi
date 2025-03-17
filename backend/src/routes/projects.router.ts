const express = require('express'),
    router = express.Router(),
    projectsController = require('../controllers/projects.controller');

router.get('/:id/members', projectsController.getMembers);
router.post('/:id/members', projectsController.addMembers);
router.delete('/:projectId/members/:userId', projectsController.deleteMember);

module.exports = router;