const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, slug FROM categories ORDER BY name ASC');
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

const generateSlug = (text) => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const slug = req.body.slug && req.body.slug.trim() ? req.body.slug.trim() : generateSlug(name);
    const [result] = await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name.trim(), slug]);
    res.status(201).json({ id: result.insertId, message: 'Category created', slug });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const slug = req.body.slug && req.body.slug.trim() ? req.body.slug.trim() : generateSlug(name);
    await db.query('UPDATE categories SET name=?, slug=? WHERE id=?', [name.trim(), slug, id]);
    res.json({ message: 'Category updated', slug });
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
