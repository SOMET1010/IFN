import { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { disputeService, type DisputeType } from '@/services/dispute/disputeService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SubmitDispute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<DisputeType>('commande_non_reçue');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const submit = async () => {
    const evidence: string[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        evidence.push(files[i].name);
      }
    }
    const res = await disputeService.create({
      user_id: user?.id || 'u-unknown',
      user_name: user?.name || 'Utilisateur',
      transaction_id: undefined,
      type,
      title: 'Litige utilisateur',
      description,
      amount: amount ? parseFloat(amount) : undefined,
      status: 'open',
      assigned_agent: undefined,
      evidence,
      messages: [],
    });
    if (res.success && res.data) {
      navigate(`/admin/disputes/${res.data.id}`);
    }
  };

  return (
    <DashboardLayout title="Soumettre un litige" subtitle="Projet d'inclusion économique, financière et numérique du secteur informel en Côte d'Ivoire.">
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de litige</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de litige</Label>
              <select className="w-full border rounded-md px-3 py-2" value={type} onChange={(e)=>setType(e.target.value as DisputeType)}>
                <option value="commande_non_reçue">Commande non reçue</option>
                <option value="erreur_transaction">Erreur de transaction</option>
                <option value="probleme_paiement">Problème de paiement</option>
                <option value="remboursement">Litige de remboursement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <Label>Description du litige</Label>
              <Textarea placeholder="Décrivez précisément le problème rencontré..." rows={5} value={description} onChange={(e)=>setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Montant impliqué (si applicable)</Label>
              <Input type="number" placeholder="FCFA 0.00" value={amount} onChange={(e)=>setAmount(e.target.value)} />
            </div>
            <div>
              <Label>Ajouter des preuves</Label>
              <Input type="file" multiple onChange={(e)=>setFiles(e.target.files)} />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF jusqu'à 10MB</p>
            </div>
            <div className="pt-2">
              <Button onClick={submit} className="w-full sm:w-auto">Soumettre le litige</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

