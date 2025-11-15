import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories";
import AddProduct from "../pages/AddProduct";

export const protectedRoutes = [
  {
    path: "/",
    element: Dashboard,
  },
  {
    path: "/categories",
    element: Categories,
  },
  {
    path: "/products/add",
    element: AddProduct,
  },
];
