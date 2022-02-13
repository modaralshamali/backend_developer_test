require("dotenv").config();
const db = require("./config/read_db");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

let user_token;

const app = express();

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    db.check_user_exists(email)
    .then(async (check_data) => {
      if (check_data.length != 0) {
        return res.status(409).send("User Already Exist. Please Login");
      }

      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
      
      // Create user in our database
      db.register_user(email, encryptedPassword)
      .then((register_data) => {
        // Create token
        const token = jwt.sign(
          { user_id: register_data[0], email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // save user token
        user_token = token;

        // return new user
        res.status(201).json({
          email,
          encryptedPassword,
          user_token
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    db.check_user_exists(email)
    .then(async (validation_data) => {
      if (validation_data.length != 0 && (await bcrypt.compare(password, validation_data[0].password))) {
        // Create token
        const token = jwt.sign(
          { user_id: validation_data[0].id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user_token = token;
  
        // user
        return res.status(200).json({
          email: email,
          password: validation_data[0].password,
          token: user_token
        });
      }
      return res.status(400).send("Invalid Credentials");
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/products', auth, (req, res) => {
  try {
    // Get user input
    const { products } = req.body;

    // Validate user input
    if (!(products)) {
      return res.status(400).send("All input is required");
    }
    
    db.add_products(products)
    .then((result) => {
      if(result.length != 0) {
        return res.status(200).send("Products added successfully ...");
      } else {
        return res.status(200).send("An Error with adding products ... All input is required");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.get('/products', auth, (req, res) => {
  try {
    db.get_all_products()
    .then((products) => {
      if(products.length == 0) {
        return res.send("No products Found");
      }
      return res.status(200).json(products);
    });
  } catch(error) {
    console.log(err);
  }
});

app.get('/products/:product_id', auth, (req, res) => {
  try {
    let product_id = req.params['product_id'];

    db.get_product_by_id(product_id)
    .then((product) => {
      return res.status(200).send(product);
    });
  } catch(error) {
    console.log(err);
  }
});

app.put('/products/:product_id', auth, (req, res) => {
  try {
    let product_id = req.params['product_id'];
    // Get user input
    const { 
      name, 
      creation_date, 
      start_date,
      duration,
      price,
      custom_fields,
      category 
    } = req.body;

    // Validate user input
    if (!(product_id && name && creation_date && start_date && duration && price && custom_fields && category)) {
      return res.status(400).send("All input is required");
    }

    db.add_product_by_id(product_id, name, creation_date, start_date, duration, price, JSON.stringify(custom_fields), category)
    .then((add_res) => {
      return res.status(200).json({ 
        name, 
        creation_date, 
        start_date,
        duration,
        price,
        custom_fields,
        category 
      });
    });
  } catch (err) {
    console.log(err);
  }
});

app.delete('/products/:product_id', auth, (req, res) => {
  try {
    let product_id = req.params['product_id'];

    db.delete_product_by_id(product_id)
    .then((result) => {
      if(result == 1) {
        return res.status(200).send("Product deleted successfuly ...");
      } else {
        return res.status(200).send("Product already deleted ...");
      }
    });
  } catch(error) {
    console.log(err);
  }
});

app.get('/categories', auth, (req, res) => {
  try {
    db.get_all_categories()
    .then((categories) => {
      return res.status(200).send(categories);
    });
  } catch(error) {
    console.log(err);
  }
});

app.get('/categories/:category_id/products', auth, (req, res) => {
  try {
    let category_id = req.params['category_id'];

    db.get_products_by_category_id(category_id)
    .then((products) => {
      return res.status(200).send(products);
    });
  } catch(error) {
    console.log(err);
  }
});

app.delete('/categories/:category_id', auth, (req, res) => {
  try {
    let category_id = req.params['category_id'];
    let res_message = '';

    db.delete_category_by_id(category_id)
    .then((result) => {
      if(result == 1) {
        res_message += "Category deleted successfuly ...";

        db.delete_products_by_category(category_id)
        .then((del_product_res) => {
          if(del_product_res > 0) {
            res_message += "Successfuly delete products of that category ...";
            return res.status(200).send(res_message);
          } else {
            res_message += "No products of that category";
            return res.status(200).send(res_message);
          }
        });
      } else {
        return res.status(200).send("Category already deleted ...");
      }
    });
  } catch(error) {
    console.log(err);
  }
});

app.get('/', (req, res) => {
  res.send("Hello ....");
});

module.exports = app;