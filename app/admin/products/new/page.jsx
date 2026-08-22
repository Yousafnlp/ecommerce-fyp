import { ProductForm } from "@/components/admin/product-form";

export const metadata = {
  title: "New Product · Admin · SpecSmart",
  description: "Create a new catalog product.",
};

export default function AdminNewProductPage() {
  return <ProductForm />;
}
