import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { createClient } from '@/lib/supabase/server'

export default async function PromotionsPage() {
  const supabase = createClient()

  const { data, error } = await supabase.from('promotions').select('*')

  if (error) {
    console.error(error)
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <section className="space-y-4 p-4">
      <h1 className="text-lg font-bold uppercase">Promoções</h1>

      <Carousel>
        <CarouselContent>
          <CarouselItem className="flex-[0_0_85%]">
            <Card className="aspect-video bg-secondary overflow-hidden"></Card>
          </CarouselItem>
          <CarouselItem className="flex-[0_0_85%]">
            <Card className="aspect-video bg-secondary overflow-hidden"></Card>
          </CarouselItem>
          <CarouselItem className="flex-[0_0_85%]">
            <Card className="aspect-video bg-secondary overflow-hidden"></Card>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>
  )
}
