//v7 imports

import admin from "./api/v1/controllers/admin/routes";
import user from "./api/v1/controllers/user/routes";
import walking from "./api/v1/controllers/walking/routes";
import running from "./api/v1/controllers/running/routes";
import cycling from "./api/v1/controllers/cycling/routes";
import earning from "./api/v1/controllers/earnings/routes";
// import contactUs from "./api/v1/controllers/contactUs/routes";
// import admin from './api/v1/controllers/admin/routes';
// import subscription from './api/v1/controllers/subscription/routes';
// import kyc from './api/v1/controllers/kyc/routes';
// import staticContent from './api/v1/controllers/static/routes';
// import faq from './api/v1/controllers/static/routes';
// import socket from './api/v1/controllers/socket/routes';
// import userManual from "./api/v1/controllers/userManual/routes"
// import notification from "./api/v1/controllers/notification/routes"
// import feedback from "./api/v1/controllers/feedback/routes"
// import banner from "./api/v1/controllers/banner/routes";
// import wishlist from "./api/v1/controllers/wishlist/routes";
// import coupon from "./api/v1/controllers/coupon/routes";
// import inventory from "./api/v1/controllers/inventory/routes";
// import category from "./api/v1/controllers/category/routes";
// import product from "./api/v1/controllers/product/routes";
// import cart from "./api/v1/controllers/cart/routes";
// import address from "./api/v1/controllers/address/routes";
// import order from "./api/v1/controllers/order/routes";
// import internalWallet from './api/v1/controllers/internalWallet/routes';


/**
 *  
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {

  app.use("/api/v1/admin", admin);
  app.use('/api/v1/user', user);
  app.use('/api/v1/walking', walking);
  app.use('/api/v1/running', running);
  app.use('/api/v1/cycling', cycling);
  app.use('/api/v1/earnings', earning);
  // app.use('/api/v1/contactUs', contactUs)
  // app.use('/api/v1/admin', admin)
  // app.use('/api/v1/kyc', kyc)
  // app.use('/api/v1/subscriotionPlan', subscription)
  // app.use('/api/v1/static', staticContent)
  // app.use('/api/v1/faq', faq)
  // app.use('/api/v1/socket', socket)
  // app.use("/api/v1/userManual", userManual)
  // app.use('/api/v1/feedback', feedback)
  // app.use("/api/v1/notification", notification)
  // app.use("/api/v1/banner", banner)
  // app.use("/api/v1/wishlist", wishlist)
  // app.use("/api/v1/coupon", coupon)
  // app.use("/api/v1/inventory", inventory)
  // app.use("/api/v1/category", category)
  // app.use("/api/v1/product", product)
  // app.use("/api/v1/cart", cart)
  // app.use("/api/v1/address", address)
  // app.use("/api/v1/order", order)
  
  // app.use('/api/v1/internal-wallet', internalWallet);









  return app;
}
