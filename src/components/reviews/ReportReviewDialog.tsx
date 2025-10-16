import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  trigger?: React.ReactNode;
  onSubmit?: (reason: string, details?: string) => void;
}

export default function ReportReviewDialog({ trigger, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');

  const submit = () => {
    onSubmit?.(reason, details);
    setOpen(false);
    setReason('spam');
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button variant="outline">Signaler</Button>}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler un avis inapproprié</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className={`block border rounded-md px-3 py-2 cursor-pointer ${reason==='spam' ? 'border-primary' : 'border-input'}`}
              onClick={() => setReason('spam')}>Spam ou contenu trompeur</label>
            <label className={`block border rounded-md px-3 py-2 cursor-pointer ${reason==='abuse' ? 'border-primary' : 'border-input'}`}
              onClick={() => setReason('abuse')}>Contenu offensant ou abusif</label>
            <label className={`block border rounded-md px-3 py-2 cursor-pointer ${reason==='pii' ? 'border-primary' : 'border-input'}`}
              onClick={() => setReason('pii')}>Contient des informations personnelles</label>
            <label className={`block border rounded-md px-3 py-2 cursor-pointer ${reason==='other' ? 'border-primary' : 'border-input'}`}
              onClick={() => setReason('other')}>Autre</label>
          </div>
          <Textarea placeholder="Détails supplémentaires (facultatif)" value={details} onChange={(e)=>setDetails(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpen(false)}>Annuler</Button>
            <Button onClick={submit}>Soumettre le signalement</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

