import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  ShoppingCart, 
  Smartphone, 
  TrendingUp,
  Shield,
  Heart,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { AnimatedCounter, AnimatedPercentage, AnimatedMillion } from "@/components/ui/animated-counter";
import { LiveCounter } from "@/components/ui/live-counter";
import { ChatWidget } from "@/components/support/ChatWidget";

const LandingPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: 15, label: "Acteurs du secteur", icon: Users, type: "million" },
    { value: 76, label: "Équipés de mobiles", icon: Smartphone, type: "percent" },
    { value: 39, label: "Femmes marchandes", icon: Heart, type: "percent" },
    { value: 88, label: "Inclusion financière", icon: TrendingUp, type: "percent" },
  ];

  const partnerLogos = [
    { name: "Orange Money", logo: "/pictogrammes/marketplace-icon.png" },
    { name: "MTN Mobile Money", logo: "/pictogrammes/marketplace-icon.png" },
    { name: "Moov Money", logo: "/pictogrammes/marketplace-icon.png" },
    { name: "Wave", logo: "/pictogrammes/marketplace-icon.png" },
  ];

  const benefits = [
    {
      title: "Marché Virtuel",
      description: "Accédez à une marketplace inclusive pour vendre et acheter des produits vivriers certifiés IGP",
      image: "/src/assets/illustrations/hero-marketplace.png",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Paiements Mobiles",
      description: "Transactions sécurisées via Orange Money, MTN, Moov et Wave pour une inclusion financière totale",
      image: "/src/assets/illustrations/mobile-payment.png",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Protection Sociale",
      description: "Cotisations CNPS, CMU et CNAM intégrées pour garantir vos droits sociaux",
      image: "/src/assets/illustrations/cooperative-dashboard.png",
      color: "from-blue-500 to-blue-600"
    }
  ];

  const testimonials = [
    {
      name: "Aminata Koné",
      role: "Marchande, Abidjan",
      quote: "Mes revenus ont augmenté de 45% grâce à la plateforme. Je peux maintenant vendre mes produits à plus de clients.",
      avatar: "👩🏾"
    },
    {
      name: "Kouassi Yao",
      role: "Producteur de cacao, Yamoussoukro",
      quote: "La traçabilité de mes produits m'a permis d'obtenir de meilleurs prix. C'est une révolution pour nous.",
      avatar: "👨🏾‍🌾"
    },
    {
      name: "Coopérative N'Zi",
      role: "Bouaké",
      quote: "Nous gérons maintenant 120 membres et nos ventes groupées ont triplé en 6 mois.",
      avatar: "🤝"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-orange-500 text-white">
                Plateforme Officielle ANSUT
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Un Marché Ouvert, Une Économie Inclusive
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                La super-application qui connecte producteurs, marchands et coopératives 
                pour une inclusion numérique et sociale en Côte d'Ivoire
              </p>
              <div className="flex gap-4 mb-6">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  onClick={() => navigate("/auth")}
                >
                  Commencer Maintenant
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  En Savoir Plus
                </Button>
              </div>
              
              <LiveCounter className="mb-4" />
              
              <motion.div
                className="flex items-center gap-2 text-gray-500 cursor-pointer"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <span className="text-sm">Découvrir plus</span>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="/src/assets/illustrations/hero-marketplace.png" 
                alt="Marché ivoirien moderne"
                className="w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-green-100 mb-4">
                  <stat.icon className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2">
                  {stat.type === "million" && <AnimatedMillion value={stat.value} />}
                  {stat.type === "percent" && <AnimatedPercentage value={stat.value} />}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Pourquoi Nous Rejoindre ?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour transformer le secteur informel ivoirien
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className={`h-48 bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                    <img 
                      src={benefit.image} 
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Ils Nous Font Confiance</h2>
            <p className="text-xl text-gray-600">Des résultats concrets pour nos utilisateurs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-6xl mb-4">{testimonial.avatar}</div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                    <div className="border-t pt-4">
                      <div className="font-bold text-orange-600">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Rejoignez la Révolution de l'Inclusion Numérique
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Plus de 15 millions d'acteurs du secteur informel vous attendent. 
              Ensemble, construisons une économie inclusive et prospère.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <div className="flex flex-col items-center gap-2">
                <img src="/pictogrammes/inscription-gratuite.png" alt="Inscription gratuite" className="w-16 h-16" />
                <span className="font-semibold">Inscription gratuite</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/pictogrammes/paiement-securise.png" alt="Paiements sécurisés" className="w-16 h-16" />
                <span className="font-semibold">Paiements sécurisés</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/pictogrammes/support-24-7.png" alt="Support 24/7" className="w-16 h-16" />
                <span className="font-semibold">Support 24/7</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Créer Mon Compte Gratuitement
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/src/assets/ivoire-logo.png" alt="Côte d'Ivoire" className="h-12 mb-4" />
              <p className="text-gray-400">
                Plateforme officielle d'inclusion numérique de la Côte d'Ivoire
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Acteurs</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Marchands</li>
                <li>Producteurs</li>
                <li>Coopératives</li>
                <li>Consommateurs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Ressources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centre d'aide</li>
                <li>Tutoriels</li>
                <li>FAQ</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Conditions d'utilisation</li>
                <li>Politique de confidentialité</li>
                <li>Mentions légales</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ANSUT - Tous droits réservés</p>
          </div>
        </div>
      </footer>
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default LandingPage;

