import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminUsers = () => {
  const users = [
    { 
      id: 1,
      name: "Kouadio Amani", 
      email: "kouadio@agritrack.ci",
      role: "producer",
      location: "Abidjan",
      phone: "+225 01 02 03 04",
      joinDate: "2023-01-15",
      lastActive: "2024-03-15",
      status: "active"
    },
    { 
      id: 2,
      name: "Fatou Traoré", 
      email: "fatou@marketci.ci",
      role: "merchant",
      location: "Bouaké",
      phone: "+225 05 06 07 08",
      joinDate: "2023-02-20",
      lastActive: "2024-03-14",
      status: "active"
    },
    { 
      id: 3,
      name: "Yao N'Guessan", 
      email: "yao@cooperative.ci",
      role: "cooperative",
      location: "Korhogo",
      phone: "+225 09 10 11 12",
      joinDate: "2023-03-10",
      lastActive: "2024-03-10",
      status: "inactive"
    },
    { 
      id: 4,
      name: "Admin Système", 
      email: "admin@inclusion.ci",
      role: "admin",
      location: "Abidjan",
      phone: "+225 13 14 15 16",
      joinDate: "2023-01-01",
      lastActive: "2024-03-15",
      status: "active"
    },
  ];

  const userStats = [
    { title: "Total utilisateurs", value: "1,248", change: "+12%" },
    { title: "Actifs ce mois", value: "892", change: "+8%" },
    { title: "Nouveaux inscrits", value: "45", change: "+15%" },
    { title: "Taux d'activation", value: "94%", change: "+2%" },
  ];

  const getStatusBadge = (status: string) => {
    const variant = status === "active" ? "default" : "secondary";
    const label = status === "active" ? "Actif" : "Inactif";
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      producer: "outline",
      merchant: "default",
      cooperative: "secondary",
      admin: "destructive"
    } as const;
    
    const labels = {
      producer: "Producteur",
      merchant: "Marchand",
      cooperative: "Coopérative",
      admin: "Admin"
    };

    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Gestion des Utilisateurs" subtitle="Administrez les comptes utilisateurs">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un utilisateur..." 
              className="pl-10"
            />
          </div>
          <Button variant="ivoire" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground">
                <span>UTILISATEUR</span>
                <span>EMAIL</span>
                <span>RÔLE</span>
                <span>LOCALISATION</span>
                <span>INSCRIPTION</span>
                <span>DERNIÈRE ACTIVITÉ</span>
                <span>STATUT</span>
                <span>ACTIONS</span>
              </div>
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-8 gap-4 text-sm py-3 border-b items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="text-muted-foreground">{user.email}</span>
                  <span>{getRoleBadge(user.role)}</span>
                  <span>{user.location}</span>
                  <span>{user.joinDate}</span>
                  <span>{user.lastActive}</span>
                  <span>{getStatusBadge(user.status)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;