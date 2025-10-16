import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { disputeService, type Dispute, type DisputeStatus } from '@/services/dispute/disputeService';

const statusLabel: Record<DisputeStatus, string> = {
  open: 'Ouvert', in_review: 'En cours', pending: 'En attente', resolved: 'Résolu', rejected: 'Rejeté'
};

export default function AdminDisputeDetail() {
  const { id } = useParams();
  const [d, setD] = useState<Dispute | null>(null);
  const [message, setMessage] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);

  useEffect(() => {
    disputeService.initializeDemoData();
    if (!id) return;
    disputeService.getById(id).then(res => {
      if (res.success && res.data) setD(res.data);
    });
  }, [id]);

  const addMessage = async () => {
    if (!id || !message.trim()) return;
    const res = await disputeService.addMessage(id, {
      sender_id: 'support-1',
      sender_name: 'Support FinTech CI',
      sender_role: 'admin',
      message,
    });
    if (res.success && res.data) {
      setD(res.data);
      setMessage('');
    }
  };

  const addEvidence = async () => {
    if (!id || fileNames.length === 0) return;
    const res = await disputeService.addEvidence(id, fileNames);
    if (res.success && res.data) {
      setD(res.data);
      setFileNames([]);
    }
  };

  const updateStatus = async (status: DisputeStatus) => {
    if (!id) return;
    const res = await disputeService.update(id, { status });
    if (res.success && res.data) setD(res.data as Dispute);
  };

  if (!d) return (
    <DashboardLayout title="Litige" subtitle="Chargement...">
      <div className="p-6">Chargement…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={`Litige #${d.id}`} subtitle={`Ouvert le ${new Date(d.created_at).toLocaleDateString('fr-FR')}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant={d.status === 'resolved' ? 'default' : d.status === 'rejected' ? 'destructive' : 'outline'}>
            {statusLabel[d.status]}
          </Badge>
          <div className="text-sm text-muted-foreground">Statut actuel</div>
        </div>

        {/* Historique des communications */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des communications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(d.messages || []).length === 0 && (
                <div className="text-sm text-muted-foreground">Aucun message pour l'instant.</div>
              )}
              {d.messages?.map(m => (
                <div key={m.id} className={`max-w-2xl ${m.sender_role === 'admin' ? 'ml-auto' : ''}`}>
                  <div className={`rounded-lg p-3 ${m.sender_role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div className="text-xs opacity-80 mb-1">{m.sender_name} • {new Date(m.timestamp).toLocaleString('fr-FR')}</div>
                    <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Réponse */}
            <div className="mt-4 space-y-2">
              <Textarea placeholder="Votre message..." value={message} onChange={(e)=>setMessage(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={addMessage} disabled={!message.trim()}>Envoyer</Button>
                <Input type="text" placeholder="Ajouter une preuve (nom de fichier)" value={fileNames.join(', ')} onChange={(e)=>setFileNames(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
                <Button variant="outline" onClick={addEvidence} disabled={fileNames.length===0}>Ajouter preuve</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preuves */}
        <Card>
          <CardHeader>
            <CardTitle>Preuves soumises</CardTitle>
          </CardHeader>
          <CardContent>
            {(!d.evidence || d.evidence.length === 0) ? (
              <div className="text-sm text-muted-foreground">Aucune preuve fournie.</div>
            ) : (
              <ul className="list-disc pl-6">
                {d.evidence.map((f, idx)=> <li key={idx}>{f}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Actions statut */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>updateStatus('in_review')}>Passer en cours</Button>
          <Button variant="outline" onClick={()=>updateStatus('resolved')}>Marquer résolu</Button>
          <Button variant="destructive" onClick={()=>updateStatus('rejected')}>Rejeter</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

