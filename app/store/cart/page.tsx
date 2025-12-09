"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Trash2, ShoppingBag, ArrowRight, FileText, BookOpen } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, clearCart, cartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCheckout = async () => {
    setLoading(true)
    
    // 1. Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please login to complete purchase")
      router.push("/auth/login?next=/store/cart")
      return
    }

    try {
      // 2. Process Purchases (Unified for Books & Case Files)
      const purchasePromises = items.map(item => 
        supabase.from('purchases').insert({
          user_id: user.id,
          item_type: item.type, // 'book' or 'case_file' (comes from CartContext)
          item_id: item.id,
          amount: item.price,
          payment_status: 'completed', // Free/Mock for now
          payment_id: `free_${Date.now()}_${Math.random().toString(36).substring(7)}`
        })
      )

      const results = await Promise.all(purchasePromises)
      
      const errors = results.filter(r => r.error)
      if (errors.length > 0) throw errors[0].error

      // 3. Success
      toast.success("Purchase Successful!", {
        description: "Items have been added to your Profile library."
      })
      clearCart()
      router.push("/profile")
      
    } catch (error: any) {
      console.error(error)
      toast.error("Checkout Failed", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="container mx-auto py-20 px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <h1 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h1>
      <p className="text-muted-foreground mb-8">Add case files or books to get started.</p>
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push("/case-files")}>Browse Cases</Button>
        <Button onClick={() => router.push("/store")}>Browse Store</Button>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart List */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <Card key={`${item.id}-${idx}`} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${item.type === 'book' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                   {item.type === 'book' ? <BookOpen className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {item.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Digital Copy</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-14 sm:pl-0">
                <span className="font-bold text-lg">₹{item.price}</span>
                <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="font-semibold text-xl mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹0.00</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6 flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl">₹{cartTotal}</span>
            </div>
            
            <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
              {loading ? "Processing..." : "Checkout Now"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Secure payments powered by Razorpay (Simulated)
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}