import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Users,
  Leaf,
  TrendingUp,
  ShoppingBasket,
  BarChart3,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const fadeInDown = {
  hidden: { y: -30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatAnimation2 = {
  animate: {
    y: [0, 15, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top navigation */}
      <motion.header
        className="sticky top-0 z-40 backdrop-blur bg-background/75 border-b"
        initial="hidden"
        animate="visible"
        variants={fadeInDown}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2 font-semibold"
            variants={fadeInUp}
          >
            <span className="text-xl">🇨🇮</span>
            <span className="text-sm sm:text-base">Inclusion Numérique · Côte d'Ivoire</span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center gap-4 lg:gap-6 text-sm"
            variants={containerVariants}
          >
            {['Marché', 'Avantages', 'Impact'].map((item, index) => (
              <motion.a
                key={item}
                href={item === 'Marché' ? '/marketplace' : `#${item.toLowerCase()}`}
                className="hover:text-primary transition-colors"
                variants={fadeInUp}
                custom={index * 0.1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.a>
            ))}
            <motion.div variants={fadeInUp} custom={0.3}>
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                variant="ivoire"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Se connecter
              </Button>
            </motion.div>
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.div
            className="md:hidden"
            variants={fadeInUp}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const mobileMenu = document.getElementById('mobile-menu');
                mobileMenu?.classList.toggle('hidden');
              }}
              className="p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation Menu */}
        <div id="mobile-menu" className="hidden md:hidden bg-background border-b">
          <nav className="px-4 py-3 space-y-2">
            {['Marché', 'Avantages', 'Impact'].map((item) => (
              <motion.a
                key={item}
                href={item === 'Marché' ? '/marketplace' : `#${item.toLowerCase()}`}
                className="block py-2 text-sm hover:text-primary transition-colors"
                onClick={() => {
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.a>
            ))}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => {
                  navigate('/login');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
                size="sm"
                variant="ivoire"
                className="w-full mt-2"
              >
                Se connecter
              </Button>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* Hero: minimal, lumineux, orienté recherche */}
      <motion.section
        className="relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          {...floatAnimation}
        />
        <motion.div
          className="absolute -bottom-28 -right-20 h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-3xl"
          {...floatAnimation2}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div variants={containerVariants}>
              <motion.div variants={fadeInUp}>
                <Badge className="bg-primary/10 text-primary border-primary/20">Programme stratégique national</Badge>
              </motion.div>
              <motion.h1
                className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
                variants={fadeInUp}
              >
                Un Marché <span className="text-primary">ouvert</span>,
                <br /> une Économie <span className="text-secondary">inclusive</span>
              </motion.h1>
              <motion.p
                className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl"
                variants={fadeInUp}
              >
                Accédez au marché vivrier ivoirien, payez en mobile money et bénéficiez
                d'une meilleure traçabilité et protection sociale.
              </motion.p>
              {/* Quick facts */}
              <motion.div
                className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                variants={containerVariants}
              >
                {[{ v: '15M', l: 'Acteurs du secteur' }, { v: '76%', l: 'Équipés de mobiles' }, { v: '39%', l: 'Femmes marchandes' }, { v: '8%', l: 'Couverture sociale' }].map((it, index) => (
                  <motion.div
                    key={it.l}
                    className="text-center p-3 bg-muted/30 rounded-lg"
                    variants={fadeInUp}
                    custom={index * 0.1}
                    whileHover={{
                      y: -5,
                      backgroundColor: "rgba(var(--primary) / 0.1)"
                    }}
                  >
                    <div className="text-xl sm:text-2xl font-bold">{it.v}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{it.l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right panel: actions */}
            <motion.div
              className="space-y-3 sm:space-y-4"
              variants={containerVariants}
            >
              {[
                { icon: Store, title: "Marché Virtuel", desc: "Publiez, négociez et concluez en ligne" },
                { icon: Smartphone, title: "Paiements Mobiles", desc: "Orange, MTN, Moov, Wave" },
                { icon: ShieldCheck, title: "Protection Sociale", desc: "CNPS · CMU · CNAM" }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  custom={index * 0.2}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="border border-primary/20 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm sm:text-base">{item.title}</div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Avantages */}
      <motion.section
        className="py-12 sm:py-16"
        id="avantages"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold"
            variants={fadeInUp}
          >
            Ce que vous gagnez
          </motion.h2>
          <motion.div className="mt-2 max-w-3xl mx-auto" variants={containerVariants}>
            <motion.p
              className="text-muted-foreground text-base text-center"
              variants={fadeInUp}
            >
              Des outils simples, adaptés et intégrés pour dynamiser le secteur vivrier.
            </motion.p>
            <motion.div
              className="mt-3 flex flex-wrap items-center justify-center gap-2"
              variants={containerVariants}
            >
              {[
                { icon: ShoppingBasket, text: "Simple", variant: "primary" },
                { icon: Smartphone, text: "Adaptés", variant: "secondary" },
                { icon: ShieldCheck, text: "Intégrés", variant: "primary" }
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  variants={fadeInUp}
                  custom={index * 0.1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Badge
                    variant="secondary"
                    className={`bg-${item.variant}/10 text-${item.variant} border-${item.variant}/20`}
                  >
                    <item.icon className="h-3.5 w-3.5 mr-1" /> {item.text}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left"
            variants={containerVariants}
          >
            {[
              { title: "Accès à 15 M+ d'acteurs", value: "Marché massif", icon: Users },
              { title: "Paiements mobiles natifs", value: "Rapides & sécurisés", icon: Smartphone },
              { title: "Traçabilité & qualité", value: "Origine garantie", icon: Leaf },
              { title: "Analytique en temps réel", value: "Prix & stocks", icon: BarChart3 }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={fadeInUp}
                custom={index * 0.15}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={<stat.icon className="w-6 h-6" />}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Impact prioritaire */}
      <motion.section
        className="py-6"
        id="impact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-orange-50/60 border-orange-200"
            variants={scaleIn}
            whileHover={{ scale: 1.01 }}
          >
            <CardContent className="p-6">
              <motion.h3
                className="text-lg font-semibold text-center"
                variants={fadeInUp}
              >
                Impact prioritaire
              </motion.h3>
              <motion.div
                className="mt-6 grid gap-6 sm:grid-cols-3"
                variants={containerVariants}
              >
                {[
                  { label: "Inclusion financière", value: 88, desc: "Accès aux services bancaires" },
                  { label: "Protection sociale", value: 92, desc: "Couverture et sécurité sociale" },
                  { label: "Traçabilité", value: 95, desc: "Transactions et opérations" }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    variants={fadeInUp}
                    custom={index * 0.15}
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{metric.label}</span>
                      <span className="text-primary">{metric.value}%</span>
                    </div>
                    <motion.div
                      className="mt-2"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Progress value={metric.value} className="h-2" />
                    </motion.div>
                    <p className="mt-1 text-xs text-muted-foreground">{metric.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-6 rounded-md border bg-green-50/70 px-4 py-3 text-sm"
                variants={fadeInUp}
                whileHover={{
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  y: -2
                }}
              >
                <div className="flex items-center gap-2">
                  <motion.div animate={pulseAnimation}>
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </motion.div>
                  <span className="font-medium">Notre opportunité</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Transformer ces acteurs en moteurs de croissance formelle tout en préservant
                  leur dynamique grâce au numérique.
                </p>
              </motion.div>
            </CardContent>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              <motion.h3
                className="text-2xl font-bold"
                variants={fadeInUp}
              >
                Prêt à rejoindre l'écosystème ?
              </motion.h3>
              <motion.p
                className="text-muted-foreground mt-2 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Rejoignez des milliers d'acteurs du vivrier et profitez d'un marché
                digital sécurisé, inclusif et performant.
              </motion.p>
              <motion.div
                className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
                variants={containerVariants}
              >
                {[
                  { text: "Visiter le Marché", variant: "ivoire", action: () => navigate('/marketplace') },
                  { text: "Créer un compte", variant: "outline", action: () => navigate('/signup/role') }
                ].map((btn, index) => (
                  <motion.div
                    key={btn.text}
                    variants={fadeInUp}
                    custom={index * 0.2}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant={btn.variant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"}
                      onClick={btn.action}
                    >
                      {btn.text}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="mt-10 border-t"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-center sm:text-left">© {new Date().getFullYear()} Inclusion Numérique · CI</p>
            <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {['Marché', 'Avantages', 'Impact'].map((item) => (
                <motion.a
                  key={item}
                  href={item === 'Marché' ? '/marketplace' : `#${item.toLowerCase()}`}
                  className="hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Welcome;
