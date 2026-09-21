const db = require('./config/db');

async function run() {
  try {
    await db.query("UPDATE products SET badge = 'Best Seller', is_returnable = TRUE, return_window_days = 7, return_policy_type = '7 Days Returnable', is_open_box_delivery = TRUE WHERE id = 1");
    await db.query("UPDATE products SET badge = 'Top Rated', is_returnable = TRUE, return_window_days = 10, return_policy_type = '10 Days Returnable', is_open_box_delivery = FALSE WHERE id = 45");
    await db.query("UPDATE products SET badge = 'Handmade', is_returnable = FALSE, return_window_days = 0, return_policy_type = 'Non-Returnable', is_open_box_delivery = TRUE WHERE id = 46");
    await db.query("UPDATE products SET badge = 'New Arrival', is_returnable = TRUE, return_window_days = 14, return_policy_type = '14 Days Returnable', is_open_box_delivery = TRUE WHERE id = 93");
    console.log('Sample badges and policies applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
