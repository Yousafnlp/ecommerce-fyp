import { ProductsManager } from "@/components/admin/products-manager";

export const metadata = {
  title: "Products · Admin · SpecSmart",
  description: "List, create, edit and delete catalog products.",
};

export default function AdminProductsPage() {
  return <ProductsManager />;
}
