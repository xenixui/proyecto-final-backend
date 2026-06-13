const router = require("express").Router();
const { searchArticles } = require("../../controllers/articles.controller");

router.get("/search", searchArticles);

module.exports = router;