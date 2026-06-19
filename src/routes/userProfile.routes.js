const { Router } = require("express");
const  authMiddleware  = require("../middlewares/authMiddleware");
const {
  getProfile,
  updateProfile,
  getMyArticles,
  getMyPurchases,
  getMySales,
  getMyChats,
} = require("../controllers/userProfile.controller");

const router = Router();

// Todas las rutas requieren token JWT válido + usuario ACTIVE (lo comprueba authMiddleware)
router.use(authMiddleware);

// ── Perfil 
router.get("/",  getProfile);    // GET    /api/profile       → ver perfil
router.put("/",  updateProfile); // PUT    /api/profile       → editar perfil

// ── Artículos y pedidos 
router.get("/articles",          getMyArticles);  // GET /api/profile/articles
router.get("/orders/purchases",  getMyPurchases); // GET /api/profile/orders/purchases
router.get("/orders/sales",      getMySales);     // GET /api/profile/orders/sales

// ── Chats
router.get("/chats", getMyChats); // GET /api/profile/chats

module.exports = router;
