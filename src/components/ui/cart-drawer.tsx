import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CheckoutDialog } from '@/components/ui/checkout-dialog';

export const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, getTotalItems, getTotalAmount } = useCart();

  // Use centralized formatter from utils

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Mon Panier
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart && cart.items.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex items-start space-x-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">No image</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.product.quantity} {item.product.unit} • {item.product.location}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price)} / {item.product.unit}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sous-total</span>
                  <span className="font-semibold">{formatCurrency(getTotalAmount())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Livraison</span>
                  <span className="font-semibold">{formatCurrency(1000)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(getTotalAmount() + 1000)}
                  </span>
                </div>

                <div className="space-y-2">
                  <CheckoutDialog>
                    <Button className="w-full" size="lg">
                      Commander maintenant
                    </Button>
                  </CheckoutDialog>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Vider le panier
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Votre panier est vide
              </h3>
              <p className="text-gray-500 text-center">
                Ajoutez des produits à votre panier pour commencer vos achats.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
