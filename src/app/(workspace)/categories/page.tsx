import type { Metadata } from "next";

import { CategoryManager } from "@/components/categories/category-manager";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return <CategoryManager />;
}
