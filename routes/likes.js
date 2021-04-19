const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const handleLikes = require("../controllers/handleLikes");

// Get all tweets route
router.get("/list", utils.ensureAuthenticated, handleLikes.listLikes);

// Create likes
router.post("/create", utils.ensureAuthenticated, handleLikes.createLike);
