const nextRoutes = require("next-routes");
const routes = (module.exports = nextRoutes());

routes.add("apollo");


routes.add({ name: "customer", pattern: "/customer/:customerId/:customerName", page: "CustomerPage" });
