import { useState } from "react";
import { MembersList } from "@/components/cooperative/MembersList";
import { AddMemberForm } from "@/components/cooperative/AddMemberForm";
import { SocialContributionsDashboard } from "@/components/cooperative/SocialContributionsDashboard";
import { MemberContributionDetail } from "@/components/cooperative/MemberContributionDetail";
import { PaymentModal } from "@/components/cooperative/PaymentModal";
import { StockAggregationDashboard } from "@/components/cooperative/StockAggregationDashboard";
import { MemberStockContribution } from "@/components/cooperative/MemberStockContribution";
import { StockHistory } from "@/components/cooperative/StockHistory";
import { StockAlerts } from "@/components/cooperative/StockAlerts";
import { CollectivePaymentsDashboard } from "@/components/cooperative/CollectivePaymentsDashboard";
import { PaymentRedistributionModal } from "@/components/cooperative/PaymentRedistributionModal";
import { MemberEarningsDetail } from "@/components/cooperative/MemberEarningsDetail";
import { InvoiceGenerator } from "@/components/cooperative/InvoiceGenerator";
import { GroupedOffersDashboard } from "@/components/cooperative/GroupedOffersDashboard";
import { CreateGroupedOfferForm } from "@/components/cooperative/CreateGroupedOfferForm";
import { OfferNegotiationPanel } from "@/components/cooperative/OfferNegotiationPanel";
import { OfferMarketplace } from "@/components/cooperative/OfferMarketplace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Settings,
  Bell
} from "lucide-react";

const CooperativeDashboard = () => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [showContributionDetail, setShowContributionDetail] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<any>(null);
  const [showStockContribution, setShowStockContribution] = useState(false);
  const [showStockHistory, setShowStockHistory] = useState(false);
  const [showStockAlerts, setShowStockAlerts] = useState(false);
  const [showRedistributionModal, setShowRedistributionModal] = useState<any>(null);
  const [showMemberEarnings, setShowMemberEarnings] = useState<any>(null);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState<any>(null);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState<any>(null);

  const stats = [
    {
      title: "Membres Actifs",
      value: "48",
      change: "+12%",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Stock Total",
      value: "12.5T",
      change: "+8%",
      icon: Package,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Ventes du Mois",
      value: "45M FCFA",
      change: "+23%",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Commandes en Cours",
      value: "15",
      change: "+5",
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Coopérative N'Zi
              </h1>
              <p className="text-sm text-gray-500">Bouaké, Côte d'Ivoire</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon">
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-8 lg:w-auto">
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Membres
            </TabsTrigger>
            <TabsTrigger value="contributions">
              <DollarSign className="w-4 h-4 mr-2" />
              Cotisations
            </TabsTrigger>
            <TabsTrigger value="stock">
              <Package className="w-4 h-4 mr-2" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="w-4 h-4 mr-2" />
              Paiements
            </TabsTrigger>
            <TabsTrigger value="offers">
              <Package className="w-4 h-4 mr-2" />
              Offres
            </TabsTrigger>
            <TabsTrigger value="sales">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ventes
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="negotiations">
              <MessageSquare className="w-4 h-4 mr-2" />
              Négociations
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MembersList
              onAddMember={() => setShowAddMemberForm(true)}
              onViewMember={(id) => console.log("View member:", id)}
              onEditMember={(id) => console.log("Edit member:", id)}
              onDeleteMember={(id) => console.log("Delete member:", id)}
            />
          </TabsContent>

          <TabsContent value="contributions">
            <SocialContributionsDashboard
              onViewMember={(memberId) => {
                // Mock member data
                const member = {
                  memberId,
                  memberName: "Kouadio Yao",
                  cnps: { status: "up-to-date" as const, lastPayment: "2025-10-01", amount: 15000, monthlyRate: 15000 },
                  cmu: { status: "up-to-date" as const, lastPayment: "2025-10-01", amount: 1000, monthlyRate: 1000 },
                  cnam: { status: "late" as const, lastPayment: "2025-08-15", amount: 2000, daysLate: 60, monthlyRate: 2000 },
                };
                setShowContributionDetail(member);
              }}
              onPayForMember={(memberId) => {
                setShowPaymentModal({ organism: "all" as const, amount: 18000, memberName: "Kouadio Yao" });
              }}
              onGenerateReport={() => console.log("Generate report")}
            />
          </TabsContent>

          <TabsContent value="stock">
            {showStockHistory ? (
              <StockHistory onClose={() => setShowStockHistory(false)} />
            ) : showStockAlerts ? (
              <StockAlerts onClose={() => setShowStockAlerts(false)} />
            ) : (
              <StockAggregationDashboard
                onAddStock={() => setShowStockContribution(true)}
                onViewHistory={() => setShowStockHistory(true)}
                onViewAlerts={() => setShowStockAlerts(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="payments">
            <CollectivePaymentsDashboard
              onViewPayment={(id) => console.log("View payment:", id)}
              onRedistribute={(id) => {
                const mockPayment = {
                  id,
                  cooperativeId: "COOP-1",
                  cooperativeName: "Coopérative N'Zi",
                  amount: 12500000,
                  currency: "XOF" as const,
                  paymentMethod: "mobile-money" as const,
                  status: "received" as const,
                  receivedAt: new Date().toISOString(),
                  saleId: "SALE-001",
                  products: [{ productId: "1", productName: "Cacao", quantity: 5000, unitPrice: 2500, totalPrice: 12500000 }],
                  buyer: { id: "BUYER-1", name: "Établissements KOFFI", contact: "+225 07 12 34 56 78" },
                };
                setShowRedistributionModal(mockPayment);
              }}
              onGenerateInvoice={(id) => {
                const mockPayment = {
                  id,
                  cooperativeId: "COOP-1",
                  cooperativeName: "Coopérative N'Zi",
                  amount: 12500000,
                  currency: "XOF" as const,
                  paymentMethod: "mobile-money" as const,
                  status: "received" as const,
                  saleId: "SALE-001",
                  products: [{ productId: "1", productName: "Cacao", quantity: 5000, unitPrice: 2500, totalPrice: 12500000 }],
                  buyer: { id: "BUYER-1", name: "Établissements KOFFI", contact: "+225 07 12 34 56 78" },
                  invoiceNumber: "FACT-2025-001",
                };
                setShowInvoiceGenerator(mockPayment);
              }}
              onViewMemberEarnings={(memberId) => setShowMemberEarnings({ memberId, memberName: "Kouadio Yao" })}
            />
          </TabsContent>

          <TabsContent value="offers">
            <GroupedOffersDashboard
              onCreateOffer={() => setShowCreateOffer(true)}
              onEditOffer={(id) => console.log("Edit offer:", id)}
              onViewOffer={(id) => console.log("View offer:", id)}
              onDeleteOffer={(id) => console.log("Delete offer:", id)}
            />
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Ventes et Paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Module de ventes en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Module de commandes en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="negotiations">
            <Card>
              <CardHeader>
                <CardTitle>Négociations Collectives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Module de négociations en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la Coopérative</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Module de paramètres en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'ajout de membre */}
      {showAddMemberForm && (
        <AddMemberForm
          onClose={() => setShowAddMemberForm(false)}
          onSubmit={(data) => {
            console.log("New member data:", data);
            setShowAddMemberForm(false);
          }}
        />
      )}

      {/* Modal de détail des cotisations */}
      {showContributionDetail && (
        <MemberContributionDetail
          member={showContributionDetail}
          onClose={() => setShowContributionDetail(null)}
          onPay={(organism) => {
            setShowPaymentModal({
              organism,
              amount: organism === "all" ? 18000 : 15000,
              memberName: showContributionDetail.memberName,
            });
            setShowContributionDetail(null);
          }}
        />
      )}

      {/* Modal de paiement */}
      {showPaymentModal && (
        <PaymentModal
          organism={showPaymentModal.organism}
          amount={showPaymentModal.amount}
          memberName={showPaymentModal.memberName}
          onClose={() => setShowPaymentModal(null)}
          onSuccess={(txId) => {
            console.log("Payment successful:", txId);
            setShowPaymentModal(null);
          }}
        />
      )}

      {/* Modal de déclaration de stock */}
      {showStockContribution && (
        <MemberStockContribution
          memberName="Kouadio Yao"
          onClose={() => setShowStockContribution(false)}
          onSubmit={(data) => {
            console.log("Stock declaration:", data);
            setShowStockContribution(false);
          }}
        />
      )}

      {/* Modal de redistribution des paiements */}
      {showRedistributionModal && (
        <PaymentRedistributionModal
          payment={showRedistributionModal}
          onClose={() => setShowRedistributionModal(null)}
          onConfirm={(data) => {
            console.log("Redistribution confirmed:", data);
            setShowRedistributionModal(null);
          }}
        />
      )}

      {/* Modal des revenus d'un membre */}
      {showMemberEarnings && (
        <MemberEarningsDetail
          memberId={showMemberEarnings.memberId}
          memberName={showMemberEarnings.memberName}
          onClose={() => setShowMemberEarnings(null)}
        />
      )}

      {/* Modal de génération de facture */}
      {showInvoiceGenerator && (
        <InvoiceGenerator
          payment={showInvoiceGenerator}
          onClose={() => setShowInvoiceGenerator(null)}
        />
      )}

      {/* Modal de création d'offre */}
      {showCreateOffer && (
        <CreateGroupedOfferForm
          onClose={() => setShowCreateOffer(false)}
          onSubmit={(data) => {
            console.log("New offer:", data);
            setShowCreateOffer(false);
          }}
        />
      )}
    </div>
  );
};

export default CooperativeDashboard;

