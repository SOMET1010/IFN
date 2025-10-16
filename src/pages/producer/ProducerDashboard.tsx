import { ActionGrid } from "@/components/common/ActionGrid"
import { useAuth } from "@/contexts/AuthContext"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, Star, Bell, HelpCircle } from "lucide-react"
import { VocalInterface } from "@/components/producer/VocalInterface"
import ProducerLayout from "@/components/producer/ProducerLayout"
import FloatingVoiceNavigator from "@/components/producer/FloatingVoiceNavigator"

// Import des icônes personnalisées
import offresIcon from "@/assets/icones/producer/offres.png"
import recoltesIcon from "@/assets/icones/producer/recoltes.png"
import vente2Icon from "@/assets/icones/producer/vente2.png"
import commandeIcon from "@/assets/icones/producer/commande.png"
import vocalIcon from "@/assets/icones/producer/vocal.png"
import compteIcon from "@/assets/icones/producer/compte.png"

const ProducerDashboard = () => {
    const { user } = useAuth()

    // Obtenir la salutation en fonction de l'heure
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Bonjour"
        if (hour < 18) return "Bon après-midi"
        return "Bonsoir"
    }

    // Obtenir la période de la journée pour le message contextuel
    const getTimeContext = () => {
        const hour = new Date().getHours()
        if (hour < 9)
            return {
                message: "Préparez votre journée",
                icon: <Clock className="h-4 w-4" />,
            }
        if (hour < 12)
            return {
                message: "Bonne production",
                icon: <TrendingUp className="h-4 w-4" />,
            }
        if (hour < 14)
            return {
                message: "Pause déjeuner ?",
                icon: <Star className="h-4 w-4" />,
            }
        if (hour < 18)
            return {
                message: "Continuez vos ventes",
                icon: <Bell className="h-4 w-4" />,
            }
        return {
            message: "Préparez la clôture",
            icon: <Clock className="h-4 w-4" />,
        }
    }

    const timeContext = getTimeContext()

    return (
        <ProducerLayout
            title="Tableau de bord"
            showNotification={true}
            showCommunication={true}
        >
            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Section d'en-tête améliorée */}
                <div className="mb-8 sm:mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                                {getGreeting()},{" "}
                                {user?.name ||
                                    user?.email?.split("@")[0] ||
                                    "Producteur"}{" "}
                                !
                            </h1>
                            <p className="text-lg text-muted-foreground mb-3">
                                Bienvenue dans votre espace de gestion agricole
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Actions rapides */}
                <div className="mb-8 sm:mb-12">
                    <ActionGrid
                        items={[
                            {
                                to: "/producer/offers",
                                icon: (
                                    <img
                                        src={offresIcon}
                                        alt="Offres"
                                        className="w-full h-full object-contain"
                                    />
                                ),
                                label: "Offres",
                            },
                            {
                                to: "/producer/harvests",
                                icon: (
                                    <img
                                        src={recoltesIcon}
                                        alt="Récoltes"
                                        className="w-full h-full object-contain"
                                    />
                                ),
                                label: "Récoltes",
                            },
                            {
                                to: "/producer/sales",
                                icon: (
                                    <img
                                        src={vente2Icon}
                                        alt="Ventes"
                                        className="w-full h-full object-contain"
                                    />
                                ),
                                label: "Ventes",
                            },
                            {
                                to: "/producer/order-management",
                                icon: (
                                    <img
                                        src={commandeIcon}
                                        alt="Commandes"
                                        className="w-full h-full object-contain"
                                    />
                                ),
                                label: "Commandes",
                            },
                            {
                                to: "/user/preferences",
                                icon: (
                                    <img
                                        src={compteIcon}
                                        alt="Mon compte"
                                        className="w-full h-full object-contain"
                                    />
                                ),
                                label: "Mon compte",
                            },
                        ]}
                    />
                </div>
            </main>
            <FloatingVoiceNavigator />
        </ProducerLayout>
    )
}

export default ProducerDashboard
