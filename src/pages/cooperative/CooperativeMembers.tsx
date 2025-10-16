import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Phone, MapPin, Calendar, Edit, Trash2, Search } from 'lucide-react';
import { MemberForm } from '@/components/cooperative/MemberForm';
import { memberService, CooperativeMember } from '@/services/cooperative/memberService';
import { useState, useEffect } from 'react';

const CooperativeMembers = () => {
  const [members, setMembers] = useState<CooperativeMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setMembers(memberService.getAll());
  }, []);

  useEffect(() => {
    if (searchTerm || statusFilter !== 'all') {
      let filtered = memberService.getAll();

      if (searchTerm) {
        filtered = memberService.search(searchTerm);
      }

      if (statusFilter !== 'all') {
        filtered = memberService.filterByStatus(statusFilter);
      }

      setMembers(filtered);
    } else {
      setMembers(memberService.getAll());
    }
  }, [searchTerm, statusFilter]);

  const stats = memberService.getStats();

  const memberStats = [
    { title: "Total membres", value: stats.total.toString(), change: stats.newThisMonth > 0 ? `+${stats.newThisMonth}` : "" },
    { title: "Membres actifs", value: stats.active.toString(), change: "" },
    { title: "En attente", value: stats.pending.toString(), change: "" },
    { title: "Contribution moyenne", value: formatCurrency(stats.averageContribution), change: "" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline"
    } as const;
    
    const labels = {
      active: "Actif",
      inactive: "Inactif",
      pending: "En attente"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getRoleColor = (role: string) => {
    const colors = {
      "Producteur": "bg-green-100 text-green-800",
      "Marchande": "bg-blue-100 text-blue-800",
      "Transformatrice": "bg-purple-100 text-purple-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleMemberCreated = (newMember: CooperativeMember) => {
    setMembers(memberService.getAll());
  };

  const handleMemberUpdated = (updatedMember: CooperativeMember) => {
    setMembers(memberService.getAll());
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      memberService.delete(memberId);
      setMembers(memberService.getAll());
    }
  };

  const handleActivateMember = (memberId: string) => {
    memberService.activateMember(memberId);
    setMembers(memberService.getAll());
  };

  return (
    <DashboardLayout title="Membres" subtitle="Gérez les membres de la coopérative">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {memberStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && <p className="text-xs text-green-600">{stat.change}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, rôle, localisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                    <SelectItem value="suspended">Suspendus</SelectItem>
                  </SelectContent>
                </Select>
                <MemberForm onSuccess={handleMemberCreated} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Liste des membres ({members.length})</h2>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(member.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Membre depuis {member.joinDate}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Produits</span>
                  <div className="flex flex-wrap gap-1">
                    {member.products.map((product, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Contribution</span>
                    <span className="font-semibold">{formatCurrency(member.contribution)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <MemberForm
                    member={member}
                    onSuccess={handleMemberUpdated}
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {member.status !== 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActivateMember(member.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Activer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CooperativeMembers;
