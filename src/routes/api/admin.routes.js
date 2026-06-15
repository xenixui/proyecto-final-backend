const { getProfiles } = require('../../controllers/admin.controller');

const router = require('express').Router();

// Ver listado de perfiles (filtro por rol)
router.get('/profiles', getProfiles);

// Ver datos de un perfil
//router.get('/profiles/:id');

// Dar de baja
//router.delete('/profiles/:id');

// Bloquear perfil
//router.patch('/profiles/:id/block');

// Gestionar roles
//router.patch('/profiles/:id/role');

module.exports = router; 