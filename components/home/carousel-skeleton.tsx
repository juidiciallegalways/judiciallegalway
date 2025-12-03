import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CarouselSkeleton({ itemsPerView = 3 }: { itemsPerView?: number }) {
  return (
    <div className="flex gap-6">
      {Array.from({ length: itemsPerView }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0"
          style={{ width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * 24) / itemsPerView}px)` }}
        >
          <Card className="overflow-hidden rounded-xl">
            <Skeleton className="h-48 w-full rounded-none" />
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
