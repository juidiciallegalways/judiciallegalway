"use client"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { Lock, BookOpen, ShoppingBag } from "lucide-react"

export function CaseFileDetailContent({ caseFile }: { caseFile: any }) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: caseFile.id,
      title: caseFile.title,
      price: caseFile.price,
      type: 'case_file'
    })
    toast.success("Added to Cart")
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Badge className="mb-4">{caseFile.category}</Badge>
        <h1 className="text-4xl font-serif font-bold mb-2">{caseFile.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{caseFile.case_number} • {caseFile.court_name}</p>

        <div className="bg-slate-50 p-6 rounded-xl border mb-8">
          <h3 className="font-bold mb-2">Summary</h3>
          <p>{caseFile.description}</p>
        </div>

        <div className="flex gap-4">
          {caseFile.is_premium ? (
            <Button size="lg" onClick={handleAddToCart} className="gap-2">
              <ShoppingBag className="w-5 h-5" /> Buy for ₹{caseFile.price}
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href={`/reader/${caseFile.id}`}>
                <BookOpen className="w-5 h-5 mr-2" /> Read Now
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}