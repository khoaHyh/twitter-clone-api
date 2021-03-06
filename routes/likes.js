const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleLikes = require("../controllers/handleLikes");

router.get("/list", utils.ensureAuthenticated, handleLikes.listLikes);

router.post("/create", utils.ensureAuthenticated, handleLikes.createLike);

router.delete("/delete", utils.ensureAuthenticated, handleLikes.deleteLike);

module.exports = router;
