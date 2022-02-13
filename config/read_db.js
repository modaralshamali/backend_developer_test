const database = require("./database");

function check_user_exists(email) {
  return database.select("*").from("Users").where({ email });
}

function register_user(email, password) {
  return database("Users").insert({ 
    email,
    password
  });
}

function login_user() {
  return database.raw(`select a.A, a.exposure_time from ir_calibration a`);
}

async function add_products(products) {
  let added_products = [];
  for (const product of products) {
    // Validate user input
    if (!(product.name && product.creation_date && product.start_date && product.duration && product.price && product.custom_fields && product.category)) {
      return [];
    }
    await database("Products").insert({
      name: product.name, 
      creation_date: product.creation_date, 
      start_date: product.start_date, 
      duration: product.duration,
      price: product.price,
      custom_fields: JSON.stringify(product.custom_fields),
      category: product.category
    })
    .then((res) => {
      added_products.push(res[0]);
    });
  }
  return added_products;
}

function add_product(name, creation_date, start_date, duration, price, custom_fields, category) {
  return database("Products").insert({
    name,
    creation_date,
    start_date,
    duration,
    price,
    custom_fields,
    category
  });
}

function add_product_by_id(id, name, creation_date, start_date, duration, price, custom_fields, category) {
  return database("Products").insert({
    id,
    name,
    creation_date,
    start_date,
    duration,
    price,
    custom_fields,
    category
  });
}

function get_all_products() {
  return database.select("*").from("Products");
}

function get_product_by_id(id) {
  return database.select("*").from("Products").where({ id });
}

function delete_product_by_id(id) {
  return database("Products").where({ id }).del();
}

function get_all_categories() {
  return database.select("*").from("Categories");
}

function get_category_by_id(id) {
  return database.select("*").from("Categories").where({ id });
}

function get_products_by_category_id(category) {
  return database.select("*").from("Products").where({ category });
}

function delete_products_by_category(category) {
  return database("Products").where({ category }).del();
}

function delete_category_by_id(id) {
  return database("Categories").where({ id }).del();
}

module.exports = {
  register_user,
  login_user,
  check_user_exists,
  add_product,
  add_products,
  add_product_by_id,
  get_all_products,
  get_product_by_id,
  delete_product_by_id,
  get_all_categories,
  get_category_by_id,
  get_products_by_category_id,
  delete_products_by_category,
  delete_category_by_id
}