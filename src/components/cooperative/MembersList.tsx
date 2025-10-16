import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  id: string;
  name: string;
  role: string;
  status: "active" | "pending" | "inactive";
  phone: string;
  email: string;
  joinDate: string;
  avatar?: string;
  contribution: number;
  socialContributions: {
    cnps: boolean;
    cmu: boolean;
    cnam: boolean;
  };
}

const mockMembers: Member[] = [
  {
    id: "1",
    name: "Kouadio Yao",
    role: "Producteur de cacao",
    status: "active",
    phone: "+225 07 12 34 56 78",
    email: "k.yao@example.ci",
    joinDate: "2024-01-15",
    contribution: 2500000,
    socialContributions: { cnps: true, cmu: true, cnam: true }
  },
  {
    id: "2",
    name: "Aminata Traoré",
    role: "Productrice de café",
    status: "active",
    phone: "+225 05 98 76 54 32",
    email: "a.traore@example.ci",
    joinDate: "2024-02-20",
    contribution: 1800000,
    socialContributions: { cnps: true, cmu: true, cnam: false }
  },
  {
    id: "3",
    name: "Koné Seydou",
    role: "Producteur d'anacarde",
    status: "pending",
    phone: "+225 01 23 45 67 89",
    email: "k.seydou@example.ci",
    joinDate: "2025-10-10",
    contribution: 0,
    socialContributions: { cnps: false, cmu: false, cnam: false }
  },
  {
    id: "4",
    name: "Bamba Fatou",
    role: "Productrice de karité",
    status: "active",
    phone: "+225 07 11 22 33 44",
    email: "b.fatou@example.ci",
    joinDate: "2024-03-05",
    contribution: 3200000,
    socialContributions: { cnps: true, cmu: true, cnam: true }
  },
  {
    id: "5",
    name: "Ouattara Ibrahim",
    role: "Producteur de mangues",
    status: "inactive",
    phone: "+225 05 55 66 77 88",
    email: "o.ibrahim@example.ci",
    joinDate: "2023-11-20",
    contribution: 1200000,
    socialContributions: { cnps: true, cmu: false, cnam: false }
  },
];

interface MembersListProps {
  onAddMember?: () => void;
  onViewMember?: (memberId: string) => void;
  onEditMember?: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const MembersList = ({
  onAddMember,
  onViewMember,
  onEditMember,
  onDeleteMember
}: MembersListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [members] = useState<Member[]>(mockMembers);

  const getStatusBadge = (status: Member["status"]) => {
    const config = {
      active: { label: "Actif", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
      pending: { label: "En attente", color: "bg-orange-100 text-orange-700 border-orange-300", icon: Clock },
      inactive: { label: "Inactif", color: "bg-gray-100 text-gray-700 border-gray-300", icon: XCircle },
    };
    
    const { label, color, icon: Icon } = config[status];
    
    return (
      <Badge className={`${color} border flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === "active").length,
    pending: members.filter(m => m.status === "pending").length,
    inactive: members.filter(m => m.status === "inactive").length,
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Membres</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500">Actifs</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
              <div className="text-sm text-gray-500">Inactifs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Membres de la Coopérative</span>
            <Button 
              onClick={onAddMember}
              className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un Membre
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grille de membres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Avatar et statut */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-white font-bold text-lg">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      {getStatusBadge(member.status)}
                    </div>

                    {/* Informations de contact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>

                    {/* Cotisations sociales */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Cotisations sociales :</p>
                      <div className="flex gap-2">
                        <Badge variant={member.socialContributions.cnps ? "default" : "outline"} className="text-xs">
                          CNPS
                        </Badge>
                        <Badge variant={member.socialContributions.cmu ? "default" : "outline"} className="text-xs">
                          CMU
                        </Badge>
                        <Badge variant={member.socialContributions.cnam ? "default" : "outline"} className="text-xs">
                          CNAM
                        </Badge>
                      </div>
                    </div>

                    {/* Contribution */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Contribution totale</p>
                      <p className="text-lg font-bold text-green-600">
                        {member.contribution.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewMember?.(member.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditMember?.(member.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteMember?.(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun membre trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

