import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseHole } from "@shared/schema";

interface CourseHoleCardProps {
  hole: CourseHole;
  isCurrent?: boolean;
  score?: number;
}

export default function CourseHoleCard({ hole, isCurrent = false, score }: CourseHoleCardProps) {
  const getParColor = (par: number) => {
    switch (par) {
      case 3:
        return 'bg-green-100 text-green-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      case 5:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`transition-all ${
      isCurrent 
        ? 'border-2 border-golf-gold bg-golf-gold/5 shadow-lg' 
        : 'border border-gray-200 hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
              isCurrent ? 'bg-golf-gold' : 'bg-golf-green'
            }`}>
              {hole.holeNumber}
            </div>
            <div>
              <Badge className={getParColor(hole.par)}>
                Par {hole.par}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Handicap {hole.handicap}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-golf-green">{hole.yardage}</div>
            <div className="text-sm text-gray-600">yards</div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{hole.description}</p>
        
        {hole.notes && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Note:</strong> {hole.notes}
          </div>
        )}
        
        {score && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Your Score:</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                score <= hole.par ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {score}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
