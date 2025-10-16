import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Heart,
  Phone,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MemberSocialContributions, ContributionStats, PaymentHistoryItem } from "@/types/socialContributions";

// Données mockées
const mockContributions: MemberSocialContributions[] = [
  {
    memberId: "1",
    memberName: "Kouadio Yao",
    cnps: { status: "up-to-date", lastPayment: "2025-10-01", amount: 15000, monthlyRate: 15000 },
    cmu: { status: "up-to-date", lastPayment: "2025-10-01", amount: 1000, monthlyRate: 1000 },
    cnam: { status: "late", lastPayment: "2025-08-15", amount: 2000, daysLate: 60, monthlyRate: 2000 },
  },
  {
    memberId: "2",
    memberName: "Aminata Traoré",
    cnps: { status: "up-to-date", lastPayment: "2025-10-05", amount: 15000, monthlyRate: 15000 },
    cmu: { status: "up-to-date", lastPayment: "2025-10-05", amount: 1000, monthlyRate: 1000 },
    cnam: { status: "up-to-date", lastPayment: "2025-10-05", amount: 2000, monthlyRate: 2000 },
  },
  {
    memberId: "3",
    memberName: "Koné Seydou",
    cnps: { status: "not-enrolled", lastPayment: "", amount: 0, monthlyRate: 15000 },
    cmu: { status: "not-enrolled", lastPayment: "", amount: 0, monthlyRate: 1000 },
    cnam: { status: "not-enrolled", lastPayment: "", amount: 0, monthlyRate: 2000 },
  },
  {
    memberId: "4",
    memberName: "Bamba Fatou",
    cnps: { status: "up-to-date", lastPayment: "2025-10-10", amount: 15000, monthlyRate: 15000 },
    cmu: { status: "late", lastPayment: "2025-09-10", amount: 1000, daysLate: 35, monthlyRate: 1000 },
    cnam: { status: "up-to-date", lastPayment: "2025-10-10", amount: 2000, monthlyRate: 2000 },
  },
  {
    memberId: "5",
    memberName: "Ouattara Ibrahim",
    cnps: { status: "late", lastPayment: "2025-09-01", amount: 15000, daysLate: 44, monthlyRate: 15000 },
    cmu: { status: "up-to-date", lastPayment: "2025-10-01", amount: 1000, monthlyRate: 1000 },
    cnam: { status: "late", lastPayment: "2025-07-20", amount: 2000, daysLate: 86, monthlyRate: 2000 },
  },
];

const paymentHistory: PaymentHistoryItem[] = [
  { date: "Mai 2025", cnpsAmount: 720000, cmuAmount: 48000, cnamAmount: 96000 },
  { date: "Juin 2025", cnpsAmount: 735000, cmuAmount: 49000, cnamAmount: 98000 },
  { date: "Juil 2025", cnpsAmount: 750000, cmuAmount: 50000, cnamAmount: 100000 },
  { date: "Août 2025", cnpsAmount: 720000, cmuAmount: 48000, cnamAmount: 96000 },
  { date: "Sep 2025", cnpsAmount: 765000, cmuAmount: 51000, cnamAmount: 102000 },
  { date: "Oct 2025", cnpsAmount: 780000, cmuAmount: 52000, cnamAmount: 104000 },
];

const COLORS = {
  upToDate: "#22c55e",
  late: "#f97316",
  notEnrolled: "#ef4444",
};

interface SocialContributionsDashboardProps {
  onViewMember?: (memberId: string) => void;
  onPayForMember?: (memberId: string) => void;
  onGenerateReport?: () => void;
}

export const SocialContributionsDashboard = ({
  onViewMember,
  onPayForMember,
  onGenerateReport,
}: SocialContributionsDashboardProps) => {
  const [contributions] = useState<MemberSocialContributions[]>(mockContributions);

  // Calculer les statistiques
  const calculateStats = (organism: "cnps" | "cmu" | "cnam"): ContributionStats => {
    const upToDate = contributions.filter((c) => c[organism].status === "up-to-date").length;
    const late = contributions.filter((c) => c[organism].status === "late").length;
    const notEnrolled = contributions.filter((c) => c[organism].status === "not-enrolled").length;
    const totalCollected = contributions
      .filter((c) => c[organism].status === "up-to-date")
      .reduce((sum, c) => sum + c[organism].amount, 0);
    const totalDue = contributions
      .filter((c) => c[organism].status === "late")
      .reduce((sum, c) => sum + c[organism].amount, 0);

    return {
      organism,
      totalMembers: contributions.length,
      upToDate,
      late,
      notEnrolled,
      totalCollected,
      totalDue,
    };
  };

  const cnpsStats = calculateStats("cnps");
  const cmuStats = calculateStats("cmu");
  const cnamStats = calculateStats("cnam");

  // Membres en retard
  const lateMembers = contributions.filter(
    (c) => c.cnps.status === "late" || c.cmu.status === "late" || c.cnam.status === "late"
  );

  const getPieData = (stats: ContributionStats) => [
    { name: "À jour", value: stats.upToDate, color: COLORS.upToDate },
    { name: "En retard", value: stats.late, color: COLORS.late },
    { name: "Non inscrit", value: stats.notEnrolled, color: COLORS.notEnrolled },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      "up-to-date": { label: "À jour", color: "bg-green-100 text-green-700", icon: CheckCircle },
      late: { label: "En retard", color: "bg-orange-100 text-orange-700", icon: Clock },
      "not-enrolled": { label: "Non inscrit", color: "bg-red-100 text-red-700", icon: XCircle },
    };

    const { label, color, icon: Icon } = config[status as keyof typeof config];

    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cotisations Sociales</h2>
          <p className="text-gray-500">Gestion CNPS, CMU et CNAM</p>
        </div>
        <Button
          onClick={onGenerateReport}
          className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Générer un Rapport
        </Button>
      </div>

      {/* Statistiques par organisme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CNPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-blue-600">CNPS</span>
              <Users className="w-5 h-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={getPieData(cnpsStats)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getPieData(cnpsStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Collecté ce mois</span>
                  <span className="font-bold text-green-600">
                    {cnpsStats.totalCollected.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Membres à jour</span>
                  <span className="font-semibold">{cnpsStats.upToDate}/{cnpsStats.totalMembers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">En retard</span>
                  <span className="font-semibold text-orange-600">{cnpsStats.late}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CMU */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-green-600">CMU</span>
              <Heart className="w-5 h-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={getPieData(cmuStats)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getPieData(cmuStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Collecté ce mois</span>
                  <span className="font-bold text-green-600">
                    {cmuStats.totalCollected.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Membres à jour</span>
                  <span className="font-semibold">{cmuStats.upToDate}/{cmuStats.totalMembers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">En retard</span>
                  <span className="font-semibold text-orange-600">{cmuStats.late}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CNAM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-purple-600">CNAM</span>
              <Shield className="w-5 h-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={getPieData(cnamStats)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getPieData(cnamStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Collecté ce mois</span>
                  <span className="font-bold text-green-600">
                    {cnamStats.totalCollected.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Membres à jour</span>
                  <span className="font-semibold">{cnamStats.upToDate}/{cnamStats.totalMembers}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">En retard</span>
                  <span className="font-semibold text-orange-600">{cnamStats.late}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution des Paiements (6 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
              <Legend />
              <Line type="monotone" dataKey="cnpsAmount" stroke="#3b82f6" name="CNPS" strokeWidth={2} />
              <Line type="monotone" dataKey="cmuAmount" stroke="#22c55e" name="CMU" strokeWidth={2} />
              <Line type="monotone" dataKey="cnamAmount" stroke="#a855f7" name="CNAM" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Membres en retard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Membres en Retard ({lateMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>CNPS</TableHead>
                <TableHead>CMU</TableHead>
                <TableHead>CNAM</TableHead>
                <TableHead>Montant Dû</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lateMembers.map((member) => {
                const totalDue =
                  (member.cnps.status === "late" ? member.cnps.amount : 0) +
                  (member.cmu.status === "late" ? member.cmu.amount : 0) +
                  (member.cnam.status === "late" ? member.cnam.amount : 0);

                return (
                  <TableRow key={member.memberId}>
                    <TableCell className="font-medium">{member.memberName}</TableCell>
                    <TableCell>{getStatusBadge(member.cnps.status)}</TableCell>
                    <TableCell>{getStatusBadge(member.cmu.status)}</TableCell>
                    <TableCell>{getStatusBadge(member.cnam.status)}</TableCell>
                    <TableCell className="font-bold text-orange-600">
                      {totalDue.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewMember?.(member.memberId)}
                        >
                          Voir
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => onPayForMember?.(member.memberId)}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Payer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {lateMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Aucun membre en retard !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

