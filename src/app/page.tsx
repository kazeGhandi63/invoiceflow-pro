import { InvoiceForm } from "@/components/invoice-form";

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-5xl mx-auto">
        <InvoiceForm />
      </main>
    </div>
  );
}