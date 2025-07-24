// routes/adminFoodRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust if your DB file is named differently

// Show all food items
router.get('/admin/foods', (req, res) => {
  db.query('SELECT * FROM foods', (err, results) => {
    if (err) throw err;
    res.render('admin-food-list', { foods: results });
  });
});

// Show add food form
router.get('/admin/foods/add', (req, res) => {
  res.render('admin-add-food');
});

// Handle add food
router.post('/admin/foods/add', (req, res) => {
  const { name, price, category } = req.body;
  db.query('INSERT INTO foods (name, price, category) VALUES (?, ?, ?)', [name, price, category], (err) => {
    if (err) throw err;
    res.redirect('/admin/foods');
  });
});

// Show edit form
router.get('/admin/foods/edit/:id', (req, res) => {
  db.query('SELECT * FROM foods WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.render('admin-edit-food', { food: results[0] });
  });
});

// Handle edit
router.post('/admin/foods/edit/:id', (req, res) => {
  const { name, price, category } = req.body;
  db.query('UPDATE foods SET name = ?, price = ?, category = ? WHERE id = ?', [name, price, category, req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/admin/foods');
  });
});

// Delete food
router.get('/admin/foods/delete/:id', (req, res) => {
  db.query('DELETE FROM foods WHERE id = ?', [req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/admin/foods');
  });
});

module.exports = router;
