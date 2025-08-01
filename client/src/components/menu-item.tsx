import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import type { MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MenuItemCard({ item, quantity, onAdd, onRemove }: MenuItemCardProps) {
  return (
    <Card className={`border border-gray-200 hover:shadow-md transition-shadow ${
      item.isSpecial ? 'border-golf-gold bg-golf-gold/5' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-golf-green">{item.name}</h4>
            {item.isSpecial && (
              <Badge className="text-xs bg-golf-gold text-white px-2 py-1">
                Today's Special
              </Badge>
            )}
          </div>
          <span className="text-golf-gold font-bold">${item.price}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        
        {quantity === 0 ? (
          <Button
            onClick={onAdd}
            variant="outline"
            className="w-full text-golf-gold border-golf-gold hover:bg-golf-gold hover:text-white"
          >
            Add to Order
          </Button>
        ) : (
          <div className="flex items-center justify-between">
            <Button
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <span className="font-medium px-4">
              {quantity} in order
            </span>
            
            <Button
              onClick={onAdd}
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8 text-golf-gold border-golf-gold hover:bg-golf-gold hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
