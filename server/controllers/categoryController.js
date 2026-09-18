const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const [result] = await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    await db.query('UPDATE categories SET name=?, slug=? WHERE id=?', [name, slug, id]);
    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};
