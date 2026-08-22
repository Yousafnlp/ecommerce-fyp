import { OrdersView } from "@/components/admin/orders-view";

export const metadata = {
  title: "Orders · Admin · SpecSmart",
  description: "All customer orders with a revenue summary.",
};

export default function AdminOrdersPage() {
  return <OrdersView />;
}
