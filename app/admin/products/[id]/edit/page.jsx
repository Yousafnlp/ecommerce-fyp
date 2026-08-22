import { ProductEditPage } from "@/components/admin/product-edit-page";

export const metadata = {
  title: "Edit Product · Admin · SpecSmart",
  description: "Update an existing catalog product.",
};

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;
  return <ProductEditPage productId={id} />;
}
