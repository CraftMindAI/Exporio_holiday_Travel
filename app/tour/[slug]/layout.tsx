// Rendered on the server on first request, then cached; admin changes refresh it via revalidatePath().
export const revalidate = 300;

export default function TourSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
