// src/controllers/profileController.js
// Thin controller — recibe la petición, delega en el service y responde
// Mismo patrón que authController.js

const profileService = require("../services/porfileService");

// ─── Perfil ───────────────────────────────────────────────────

// GET /api/profile  →  devuelve el perfil del usuario autenticado
const getProfile = async (req, res, next) => {
  try {
    const data = await profileService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// PUT /api/profile  →  actualiza los datos editables del perfil
const updateProfile = async (req, res, next) => {
  try {
    const data = await profileService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── Artículos y pedidos ──────────────────────────────────────

// GET /api/profile/articles  →  relojes que el usuario tiene publicados
const getMyArticles = async (req, res, next) => {
  try {
    const data = await profileService.getMyArticles(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/profile/orders/purchases  →  artículos que el usuario ha comprado (status SOLD)
const getMyPurchases = async (req, res, next) => {
  try {
    const data = await profileService.getMyPurchases(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/profile/orders/sales  →  artículos del usuario que han sido vendidos
const getMySales = async (req, res, next) => {
  try {
    const data = await profileService.getMySales(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── Chats ────────────────────────────────────────────────────

// GET /api/profile/chats  →  todas las conversaciones del usuario (como comprador o vendedor)
const getMyChats = async (req, res, next) => {
  try {
    const data = await profileService.getMyChats(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyArticles,
  getMyPurchases,
  getMySales,
  getMyChats,
};
