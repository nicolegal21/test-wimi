const express = require('express'),
    router = express.Router(),
    projectsRouter = require('./projects.router');

router.use('/projects', projectsRouter);

export default router;
