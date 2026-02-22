import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories";
import Products from "../pages/Products";
import ProductEdit from "../pages/ProductEdit";
import ProductVariants from "../pages/ProductVariants";
import ServiceableAreas from "../pages/ServiceableAreas";
import Orders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";
import Subscriptions from "../pages/Subscriptions";
import SubscriptionDetail from "../pages/SubscriptionDetail";
import Customers from "../pages/Customers";
import CustomerDetail from "../pages/CustomerDetail";

export const protectedRoutes = [
  {
    path: "/",
    element: Dashboard,
  },
  {
    path: "/orders",
    element: Orders,
  },
  {
    path: "/orders/:id",
    element: OrderDetail,
  },
  {
    path: "/subscriptions",
    element: Subscriptions,
  },
  {
    path: "/subscriptions/:id",
    element: SubscriptionDetail,
  },
  {
    path: "/customers",
    element: Customers,
  },
  {
    path: "/customers/:id",
    element: CustomerDetail,
  },
  {
    path: "/categories",
    element: Categories,
  },
  {
    path: "/products",
    element: Products,
  },
  {
    path: "/products/:id/edit",
    element: ProductEdit,
  },
  {
    path: "/products/:id/variants",
    element: ProductVariants,
  },
  {
    path: "/serviceable-areas",
    element: ServiceableAreas,
  },
];
