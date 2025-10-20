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
  ChevronDown,
  Store,
  Wallet,
  Package,
  GraduationCap,
  CreditCard,
  Building2
} from "lucide-react";
import { AnimatedCounter, AnimatedPercentage, AnimatedMillion } from "@/components/ui/animated-counter";
import { LiveCounter } from "@/components/ui/live-counter";
import { ChatWidget } from "@/components/support/ChatWidget";

const LandingPage = () => {
  const navigate = useNavigate();

  // Statistiques mises à jour selon les documents PDF
  const stats = [
    { value: 15, label: "Acteurs du secteur informel", icon: Users, type: "million" },
    { value: 80, label: "Population active informelle", icon: TrendingUp, type: "percent" },
    { value: 70, label: "Femmes commerçantes", icon: Heart, type: "percent" },
    { value: 25, label: "Augmentation des revenus", icon: Smartphone, type: "percent", prefix: "+" },
  ];

  // Phase pilote
  const pilotStats = [
    { value: 1000, label: "Marchands ciblés à Abidjan" },
    { value: 15, label: "Coopératives en phase pilote" },
    { value: 60, label: "Taux de bancarisation visé", suffix: "%" },
  ];

  // Les 6 services principaux avec exemples concrets
  const services = [
    {
      icon: Store,
      title: "Gestion Commerciale",
      description: "Gérez toutes vos ventes et stocks depuis votre téléphone, recevez des alertes de rupture.",
      example: "Madame Koné saisit ses ventes d'ignames directement sur son téléphone et reçoit une alerte lorsque son stock descend sous 10kg.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Wallet,
      title: "Paiement Mobile",
      description: "Acceptez les paiements Orange Money, MTN, Wave et générez automatiquement vos factures.",
      example: "Monsieur Diallo affiche son QR code, ses clients paient par mobile money et reçoivent un reçu par SMS, sans manipulation d'espèces.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Protection Sociale",
      description: "Adhérez simplement à la CNPS/CNAM et payez vos cotisations en quelques clics.",
      example: "Madame Bamba paie 1500 FCFA/mois via la plateforme et bénéficie désormais d'une couverture maladie pour elle et ses enfants.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Package,
      title: "Gestion de Stock",
      description: "Suivez vos stocks en temps réel avec alertes automatiques et historiques.",
      example: "Suivi digital des stocks, alertes de rupture, réduction de 30% des pertes.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: ShoppingCart,
      title: "Marché Virtuel",
      description: "Présentez vos produits en ligne, recevez des commandes et organisez des livraisons groupées.",
      example: "Les vendeuses du marché d'Adjamé reçoivent des commandes de restaurants et organisent une livraison commune pour réduire les coûts.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: GraduationCap,
      title: "Formation Numérique",
      description: "Accédez à des vidéos et tutoriels pour améliorer vos compétences commerciales et numériques.",
      example: "Madame Touré regarde des tutoriels en Dioula sur la gestion des stocks pendant les temps calmes de sa journée au marché.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  // Témoignage authentique du PDF
  const testimonial = {
    name: "Aminata K.",
    role: "Commerçante au marché de Treichville",
    quote: "Grâce à cette plateforme, j'ai pu régulariser ma situation, accéder à une assurance maladie et obtenir un petit crédit pour développer mon commerce d'attiéké. Mes revenus ont augmenté de 30% en 6 mois.",
    avatar: "👩🏾"
  };

  // Bénéfices attendus
  const benefits = [
    {
      icon: TrendingUp,
      title: "Inclusion Financière",
      points: [
        "Accès facilité aux services bancaires et microfinances",
        "Paiements et transactions numériques sécurisés",
        "Taux de bancarisation à 60%"
      ]
    },
    {
      icon: Shield,
      title: "Protection Sociale",
      points: [
        "Accès simplifié à la CNPS et à la Couverture Maladie Universelle",
        "Sécurisation de l'avenir (retraite, maladie, accident)",
        "80% des utilisateurs couverts"
      ]
    },
    {
      icon: Smartphone,
      title: "Modernisation des Pratiques",
      points: [
        "Gestion numérique des stocks et ventes",
        "Traçabilité et accès à de nouveaux marchés",
        "+40% d'efficacité opérationnelle"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Bande tricolore ivoirienne en en-tête */}
      <div className="w-full h-3 flex">
        <div className="flex-1 bg-[#ff8c00]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#009e60]"></div>
      </div>

      {/* Header avec logos des institutions */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
              {/* Logos des institutions partenaires */}
              <div className="flex items-center gap-8">
                <img
                  src="/logos/LOGO ANSUT.jpg"
                  alt="ANSUT"
                  className="h-20 w-auto object-contain"
                />
                <div className="h-12 w-px bg-gray-300"></div>
                <img
                  src="/logos/dge-logo.png"
                  alt="DGE"
                  className="h-20 w-auto object-contain"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => navigate('/signup/role')}
                className="bg-gradient-to-r from-orange-500 to-green-600 text-white hover:from-orange-600 hover:to-green-700"
              >
                S'inscrire gratuitement
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-green-600 text-white border-none">
                Projet ANSUT - DGE
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Plateforme d'Inclusion Numérique
              </h1>
              <p className="text-2xl text-gray-700 mb-4 font-semibold">
                Transformer le secteur informel vivrier en Côte d'Ivoire
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Une solution innovante pour l'inclusion économique, financière et sociale des acteurs du secteur informel
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/signup/role')}
                  className="bg-gradient-to-r from-orange-500 to-green-600 text-white hover:from-orange-600 hover:to-green-700 text-lg px-8"
                >
                  Rejoindre la plateforme
                  <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/welcome')}
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 text-lg px-8"
                >
                  En savoir plus
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8">
                <img 
                  src="/src/assets/illustrations/hero-marketplace.png" 
                  alt="Marché ivoirien" 
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="text-3xl font-bold text-orange-600">+25%</div>
                  <div className="text-sm text-gray-600">Revenus en hausse</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistiques clés */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Le Contexte : Défis du Secteur Informel Ivoirien
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les marchés traditionnels sont au cœur de l'économie vivrière mais restent en marge du système formel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-orange-500">
                  <CardContent className="pt-8 pb-6">
                    <stat.icon className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                      {stat.type === "million" ? (
                        <><AnimatedMillion value={stat.value} />M</>
                      ) : (
                        <><AnimatedPercentage value={stat.value} />{stat.prefix || ""}%</>
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Phase pilote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-100 to-green-100 rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <Badge className="bg-orange-600 text-white text-lg px-6 py-2">
                Phase Pilote à Abidjan
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pilotStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold text-orange-600 mb-2">
                    <AnimatedCounter value={stat.value} />{stat.suffix || ""}
                  </div>
                  <p className="text-gray-700 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services concrets */}
      <section className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Des Services Concrets pour Changer le Quotidien
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              6 services essentiels pour moderniser votre activité commerciale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-t-4 border-orange-500 group">
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <p className="text-sm text-gray-700 italic">
                        <span className="font-semibold text-orange-600">Exemple concret :</span> {service.example}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage authentique */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-gradient-to-br from-orange-50 to-green-50 border-2 border-orange-200 shadow-2xl">
              <CardContent className="p-12">
                <div className="text-6xl mb-6 text-center">{testimonial.avatar}</div>
                <blockquote className="text-2xl text-gray-700 italic mb-6 text-center leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-center">
                  <p className="font-bold text-xl text-orange-600">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Bénéfices attendus */}
      <section className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Les Bénéfices Attendus
            </h2>
            <p className="text-2xl text-gray-700 font-semibold mb-2">
              Une vie professionnelle modernisée, sécurisée et valorisée
            </p>
            <p className="text-xl text-orange-600 font-bold">
              + de revenus | + de protection | + de reconnaissance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-green-500">
                  <CardContent className="pt-8 pb-6">
                    <benefit.icon className="h-12 w-12 mb-4 text-green-600" />
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">{benefit.title}</h3>
                    <ul className="space-y-3">
                      {benefit.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Impact global */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-600 to-green-600 rounded-2xl p-12 text-white text-center"
          >
            <h3 className="text-3xl font-bold mb-8">Impact Global Attendu</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-6xl font-bold mb-2">+25%</div>
                <p className="text-xl">Revenus des marchands</p>
              </div>
              <div>
                <div className="text-6xl font-bold mb-2">x3</div>
                <p className="text-xl">Accès à la protection sociale</p>
              </div>
              <div>
                <div className="text-6xl font-bold mb-2">70%</div>
                <p className="text-xl">Bénéficiaires femmes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Rejoignez la Révolution Numérique
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Inscrivez-vous gratuitement et transformez votre activité commerciale dès aujourd'hui
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/signup/role')}
              className="bg-gradient-to-r from-orange-500 to-green-600 text-white hover:from-orange-600 hover:to-green-700 text-xl px-12 py-6 h-auto"
            >
              S'inscrire Gratuitement
              <ChevronDown className="ml-2 h-6 w-6" />
            </Button>
            <p className="mt-6 text-gray-500">
              Inscription en 5 minutes • Support 24/7 • Formation gratuite
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Institutions Partenaires</h3>
              <ul className="space-y-2 text-gray-400">
                <li>ANSUT - Agence Nationale du Service Universel</li>
                <li>DGE - Direction Générale de l'Emploi</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Téléphone : +225 27 XX XX XX</li>
                <li>Email : contact@ansut.ci</li>
                <li>Abidjan, Côte d'Ivoire</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liens Rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/login" className="hover:text-orange-500">Se connecter</a></li>
                <li><a href="/signup/role" className="hover:text-orange-500">S'inscrire</a></li>
                <li><a href="/welcome" className="hover:text-orange-500">En savoir plus</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 ANSUT - DGE. Tous droits réservés.</p>
            <p className="mt-2">Plateforme d'Inclusion Numérique - Côte d'Ivoire</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default LandingPage;

