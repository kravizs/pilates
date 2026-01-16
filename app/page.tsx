import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ClassesSection } from "@/components/classes-section"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ClassesSection />
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <NewsletterSignup />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
