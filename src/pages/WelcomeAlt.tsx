import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Store,
  Wallet,
  ShieldCheck,
  BarChart3,
  Leaf,
  Truck,
  ChevronRight,
  Quote,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const slides = [
  {
    title: "Achetez & vendez en toute simplicité",
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2100&auto=format&fit=crop',
  },
  {
    title: "Des paiements mobiles, rapides et sécurisés",
    image:
      'https://images.unsplash.com/photo-1605901309584-818e25960a8b?q=80&w=2100&auto=format&fit=crop',
  },
  {
    title: "Soutenir les producteurs locaux",
    image:
      'https://images.unsplash.com/photo-1543339308-43f2a2de1f04?q=80&w=2100&auto=format&fit=crop',
  },
];

const WelcomeAlt = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b">
        <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-xl">🇨🇮</span>
            <span>Inclusion Numérique</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/marketplace')}>Marché</Button>
            <Button variant="ghost" onClick={() => navigate('#features')}>Solutions</Button>
            <Button variant="ivoire" size="sm" onClick={() => navigate('/login')}>Se connecter</Button>
          </div>
        </div>
      </header>

      {/* Hero carousel */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
          <div className="relative rounded-none sm:rounded-xl overflow-hidden border">
            <Carousel className="w-full">
              <CarouselContent>
                {slides.map((s, idx) => (
                  <CarouselItem key={idx}>
                    <div
                      className="relative h-[64vh] sm:h-[70vh] w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${s.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
                      <div className="relative z-10 h-full flex flex-col items-start justify-end px-6 sm:px-12 pb-10 text-white">
                        <Badge className="bg-white/20 border-white/30 text-white">Plateforme vivrière</Badge>
                        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold max-w-3xl leading-tight">
                          {s.title}
                        </h1>
                        <p className="mt-2 text-white/90 max-w-2xl">
                          Marché virtuel, paiements mobiles, logistique et protection sociale réunis au même endroit.
                        </p>
                        <div className="mt-4 flex w-full max-w-xl gap-2">
                          <Input placeholder="Rechercher un produit ou un producteur" className="bg-white" />
                          <Button variant="hero" onClick={() => navigate('/marketplace')}>
                            Explorer
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold">15M</div>
            <div className="text-sm text-muted-foreground">Acteurs du secteur</div>
          </div>
          <div>
            <div className="text-2xl font-bold">76%</div>
            <div className="text-sm text-muted-foreground">Équipés de mobiles</div>
          </div>
          <div>
            <div className="text-2xl font-bold">45%</div>
            <div className="text-sm text-muted-foreground">Alimentation urbaine</div>
          </div>
          <div>
            <div className="text-2xl font-bold">+200k</div>
            <div className="text-sm text-muted-foreground">Transactions simulées</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold">Tout pour dynamiser le vivrier</h2>
            <p className="text-muted-foreground mt-2">Des outils simples, adaptés et intégrés.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[{
              icon: <Store className="h-5 w-5" />, title: 'Marché virtuel', desc: 'Publier, négocier et conclure en ligne.'
            },{
              icon: <Wallet className="h-5 w-5" />, title: 'Paiements mobiles', desc: 'Orange, MTN, Moov, Wave.'
            },{
              icon: <ShieldCheck className="h-5 w-5" />, title: 'Protection sociale', desc: 'CNPS, CMU, CNAM.'
            },{
              icon: <BarChart3 className="h-5 w-5" />, title: 'Analytique', desc: 'Prix, stocks, tendances.'
            },{
              icon: <Leaf className="h-5 w-5" />, title: 'Traçabilité', desc: 'Qualité et origine garanties.'
            },{
              icon: <Truck className="h-5 w-5" />, title: 'Logistique', desc: 'Livraison et suivi simplifiés.'
            }].map((f, i) => (
              <Card key={i} className="group hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">{f.icon}</div>
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-md bg-primary/10 text-primary"><Quote className="h-5 w-5" /></div>
                <div>
                  <p className="text-lg">
                    “La plateforme nous a aidés à toucher de nouveaux clients et à sécuriser nos paiements.”
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Awa K., commerçante vivrière à Yopougon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold">Essayez le marché dès maintenant</h3>
          <p className="text-muted-foreground mt-2">Navigation libre, connexion requise seulement pour acheter ou vendre.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="ivoire" onClick={() => navigate('/marketplace')}>Visiter le Marché</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/signup/role')}>Créer un compte</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Inclusion Numérique · CI</p>
          <div className="flex items-center gap-4">
            <a href="/marketplace" className="hover:text-foreground">Marché</a>
            <a href="#features" className="hover:text-foreground">Solutions</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeAlt;

