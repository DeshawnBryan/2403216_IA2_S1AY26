/* Name: Deshawn Bryan 
     Student ID: 2403216
     Lecturer/Tutor: Sirisha Badhika
     Published: 21st November 2025
*/

// ========== LOGIN PAGE ==========
// Login from handling
const loginForm = document.getElementById('login-form')
if (loginForm)
{
  loginForm.addEventListener('submit', function(e)
  {
      e.preventDefault(); //stops the page from reloading and submitting the form automatically
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (username === "" || password === "")
      {
        alert("Enter both username and password!");
        return;
      }

      localStorage.setItem('username', username);
      alert(`Welcome, ${username}!`);
      loginForm.reset();
      window.location.href = "index.html";
      
  });
}

// ========== REGISTER PAGE ==========
// Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullname = registerForm.fullname.value.trim();
    const dob = registerForm.dob.value;
    const email = registerForm.email.value.trim();
    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;
    const confirmPassword = registerForm['confirm-password'].value;

    /*const fullname = document.getElementById('fullname').value.trim();
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    */

    //password confirmation check
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    //STORAGE//
    //load saved users, looks in the browser storage for a key called 'users', if no
    //users saved it returns null
    const users = JSON.parse(localStorage.getItem('users')) || [];
    //create new account, pushes values in users 
    users.push({ fullname, dob, email, username, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    alert(`Registration successful for ${fullname}!`);
    registerForm.reset();
    window.location.href = "login.html";
  });
}

// ========== HELPER FUNCTIONS (Core Storage) ==========
//Retrives cart from local storage, returns empty array if no cart exists
function getCart() 
{
  return JSON.parse(localStorage.getItem('cart')) || [];
}

//saves cart to local storage under key "cart"
function saveCart(cart) 
{
  localStorage.setItem('cart', JSON.stringify(cart));
}

//Calculates total item quantity, and updates the cart icon badge in navbart
function updateCartBadge() 
{
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  //for header
  const badge = document.getElementById('cart-count');
  if (badge) 
    badge.textContent = count;
}

//allows correct number to be shown in updateCartBadge();
updateCartBadge();

// ========== PRODUCTS PAGE ==========
//Adds a product to the cart
//Interactivity / Login
function addToCart(name, price, img) 
{
    let cart = getCart();
    //checks if same product already exists
    const existing = cart.find(item => item.name === name);
  //if product already exists, it increases quantity
    if (existing) 
    {
      //adds item even if it already exists
      existing.qty += 1;
    } else { //otherwise push new product into cart
      cart.push({ name, price, qty: 1, img });
    }
    
    saveCart(cart); //save updated cart
    updateCartBadge(); //refresh UI badge
    alert(`${name} added to cart!`);
}

// ========== CART PAGE ==========
// Cart page
//DOM Manipulation
const cartBody = document.getElementById('cart-body');
const cartSummary = document.getElementById('cart-summary');
const DISCOUNT_RATE = 0.1;
const TAX_RATE = 0.15;

//updates the quantity of a cart item
function updateQty(index, value) 
{
  let cart = getCart();
  cart[index].qty = parseInt(value); //convert input to number
  saveCart(cart);
  renderCart();
}

//Displays cart contents in the table and calculates totals
function renderCart() 
{
  if (!cartBody) return; //ensure page has table
  
  let cart = getCart();
  cartBody.innerHTML = '';
  
  let subtotalSum = 0;
  let discountSum = 0;
  let taxSum = 0;
  let totalSum = 0;

  cart.forEach((item, index) => 
  {
    const subtotal = item.price * item.qty;
    const discount = subtotal * DISCOUNT_RATE;
    const tax = (subtotal - discount) * TAX_RATE;
    const total = subtotal - discount + tax;

    subtotalSum += subtotal;
    discountSum += discount;
    taxSum += tax;
    totalSum += total;

    //generate row HTML in cart for cart
    //DOM Manipulating
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="../Assets/${item.img}" alt="${item.name}"></td>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input type="number" class="quantity-input" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)"></td>
      <td>$${subtotal.toFixed(2)}</td>
      <td>$${discount.toFixed(2)}</td>
      <td>$${tax.toFixed(2)}</td>
      <td>$${total.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    cartBody.appendChild(row);
  });

  //update summary panel
  if (cartSummary) {
    cartSummary.innerHTML = `
      <h3>Summary</h3>
      <p>Subtotal: $${subtotalSum.toFixed(2)}</p>
      <p>Total Discount: $${discountSum.toFixed(2)}</p>
      <p>Total Tax: $${taxSum.toFixed(2)}</p>
      <p><strong>Grand Total: $${totalSum.toFixed(2)}</strong></p>
    `;
  }

  updateCartBadge();
}


//allows the increase of Qty to also impact the other columns other than the price, like subtotal
function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

//Redirects to checkout if cart is not empty
function goToCheckout() {
  let cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  window.location.href = "checkout.html";
}

if (cartBody) renderCart();


// ========== CHECKOUT PAGE ==========
// Checkout 

//Ids help to identify different sections of the html
const checkoutForm = document.getElementById('checkout-form');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutSummary = document.getElementById('cart-summary');

if (checkoutForm) 
  {
  renderCheckoutItems(); //show products
  renderCheckoutSummary(); //show totals

  //EVENT Handling
  checkoutForm.addEventListener('submit', function(e) 
  {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const amount = document.getElementById('amount').value.trim();

    //validate based on filled fields
    if (!name || !address || !city || !zip || !amount) {
      alert("Please fill out all fields correctly.");
      return;
    }

    alert(`Thank you ${name}! Your order has been placed.`);
    localStorage.removeItem('cart');
    window.location.href = "index.html";
  });

  //return to cart
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    //element.addEventListener(eventName, functionToRun);
    //In this case, () defines the input parameters of the function, takes no functions
    cancelBtn.addEventListener('click', () => window.location.href = "cart.html");
  }

  //clear cart while viewing checkout
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => 
    {
      localStorage.removeItem('cart');
      renderCheckoutItems();
      renderCheckoutSummary();
    });
  }

  //exist checkout
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.location.href = "index.html");
  }
}

//FUNCTIONS USED BELOW
//Displays items in checkout page
function renderCheckoutItems() 
{

  //It stops the function from running if the checkoutItems element doesn’t exist, preventing errors.
  if (!checkoutItems) return;
  
  const cart = getCart();
//is used to clear the existing content inside the checkoutItems container before adding new content.
//displays list of items in checkout, contians all html inside that element
//removes all previously displayed items
  checkoutItems.innerHTML = '';                                        
  let total = 0;

  //show message if cart is empty

  //if nothing is in car,t say your cart is empty once "checkout" is clicked
  if (cart.length === 0) 
  {
    checkoutItems.innerHTML = '<p>Your cart is empty.</p>';
    //or alert("Your cart is empty!");
    
    //sets grand total to 0 if cart is emtpy useful if someone manually types url for checkout, otherwise redundant as you're not able to access checkout page
    if (checkoutTotal) checkoutTotal.textContent = '$0.00';
    return;
  }
}

//Displays final totals (subtotal, discount, tax)
function renderCheckoutSummary() 
{
  if (!checkoutSummary) return;
  
  const cart = getCart();
  let subtotalSum = 0;
  let discountSum = 0;
  let taxSum = 0;
  let totalSum = 0;

  cart.forEach(item => {
    //from array cart.push({ name, price, qty: 1, img });
    const subtotal = item.price * item.qty;
    const discount = subtotal * DISCOUNT_RATE;
    const tax = (subtotal - discount) * TAX_RATE;
    const total = subtotal - discount + tax;

    subtotalSum += subtotal;
    discountSum += discount;
    taxSum += tax;
    totalSum += total;
  });

//Outputs HTML summary 
  checkoutSummary.innerHTML = `
    <h3>Cart Summary</h3>
    <p>Subtotal: $${subtotalSum.toFixed(2)}</p>
    <p>Total Discount: $${discountSum.toFixed(2)}</p>
    <p>Total Tax: $${taxSum.toFixed(2)}</p>
    <p><strong>Grand Total: $${totalSum.toFixed(2)}</strong></p>
  `;
}
