import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories";
import Products from "../pages/Products";
import ProductEdit from "../pages/ProductEdit";
import ProductVariants from "../pages/ProductVariants";
import ServiceableAreas from "../pages/ServiceableAreas";

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
