import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Download,
  Mail,
  Printer,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CollectivePayment, InvoiceData } from "@/types/payments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface InvoiceGeneratorProps {
  payment: CollectivePayment;
  onClose: () => void;
  onGenerate: (invoiceData: InvoiceData) => void;
}

export const InvoiceGenerator = ({
  payment,
  onClose,
  onGenerate,
}: InvoiceGeneratorProps) => {
  const [clientInfo, setClientInfo] = useState({
    name: payment.buyer.name,
    address: "",
    phone: payment.buyer.contact,
    email: "",
  });

  const [paymentTerms, setPaymentTerms] = useState("Paiement à réception");
  const [notes, setNotes] = useState("");

  const invoiceNumber = payment.invoiceNumber || `FACT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours

  const subtotal = payment.amount;
  const taxRate = 18; // TVA 18% en Côte d'Ivoire
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const cooperativeInfo = {
    name: payment.cooperativeName,
    address: "Zone Industrielle, Yamoussoukro, Côte d'Ivoire",
    phone: "+225 27 30 12 34 56",
    email: "contact@coop-nzi.ci",
    logo: "/logo-cooperative.png",
  };

  const handleGenerate = () => {
    const invoiceData: InvoiceData = {
      invoiceNumber,
      date: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      cooperative: cooperativeInfo,
      client: clientInfo,
      items: payment.products.map((product) => ({
        description: product.productName,
        quantity: product.quantity,
        unit: "kg",
        unitPrice: product.unitPrice,
        total: product.totalPrice,
      })),
      subtotal,
      taxRate,
      taxAmount,
      total,
      paymentTerms,
      notes,
    };

    onGenerate(invoiceData);
  };

  const handleDownloadPDF = () => {
    handleGenerate();
    console.log("Téléchargement PDF de la facture", invoiceNumber);
  };

  const handleSendEmail = () => {
    handleGenerate();
    console.log("Envoi par email de la facture", invoiceNumber);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Génération de Facture</h2>
                <p className="text-white/80 mt-1">Facture N° {invoiceNumber}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Nom du Client *</Label>
                    <Input
                      id="clientName"
                      value={clientInfo.name}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, name: e.target.value })
                      }
                      placeholder="Établissements KOFFI"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Adresse *</Label>
                    <Textarea
                      id="clientAddress"
                      value={clientInfo.address}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, address: e.target.value })
                      }
                      placeholder="Adresse complète du client"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Téléphone *</Label>
                    <Input
                      id="clientPhone"
                      value={clientInfo.phone}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, phone: e.target.value })
                      }
                      placeholder="+225 07 12 34 56 78"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) =>
                        setClientInfo({ ...clientInfo, email: e.target.value })
                      }
                      placeholder="client@example.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Conditions de Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="paymentTerms">Modalités de Paiement</Label>
                    <Input
                      id="paymentTerms"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Paiement à réception"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes / Mentions Légales</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Informations complémentaires..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prévisualisation de la facture */}
            <div>
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  {/* En-tête */}
                  <div className="flex items-start justify-between pb-6 border-b-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-6 h-6 text-orange-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {cooperativeInfo.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">{cooperativeInfo.address}</p>
                      <p className="text-sm text-gray-600">{cooperativeInfo.phone}</p>
                      <p className="text-sm text-gray-600">{cooperativeInfo.email}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-3xl font-bold text-orange-600">FACTURE</h2>
                      <p className="text-sm text-gray-600 mt-1">N° {invoiceNumber}</p>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Facturé à
                      </p>
                      <p className="font-semibold text-gray-900">{clientInfo.name}</p>
                      {clientInfo.address && (
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {clientInfo.address}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">{clientInfo.phone}</p>
                      {clientInfo.email && (
                        <p className="text-sm text-gray-600">{clientInfo.email}</p>
                      )}
                    </div>
                    <div>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Date de Facture
                        </p>
                        <p className="text-sm text-gray-900">
                          {format(invoiceDate, "dd MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Date d'Échéance
                        </p>
                        <p className="text-sm text-gray-900">
                          {format(dueDate, "dd MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tableau des produits */}
                  <div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-semibold text-gray-700">
                            Description
                          </th>
                          <th className="text-right py-2 font-semibold text-gray-700">Qté</th>
                          <th className="text-right py-2 font-semibold text-gray-700">
                            P.U.
                          </th>
                          <th className="text-right py-2 font-semibold text-gray-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payment.products.map((product, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3">{product.productName}</td>
                            <td className="text-right py-3">
                              {product.quantity.toLocaleString("fr-FR")} kg
                            </td>
                            <td className="text-right py-3">
                              {product.unitPrice.toLocaleString("fr-FR")}
                            </td>
                            <td className="text-right py-3 font-semibold">
                              {product.totalPrice.toLocaleString("fr-FR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totaux */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-semibold">
                        {subtotal.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TVA ({taxRate}%)</span>
                      <span className="font-semibold">
                        {taxAmount.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2">
                      <span className="text-lg font-bold text-gray-900">TOTAL TTC</span>
                      <span className="text-2xl font-bold text-green-600">
                        {total.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Conditions */}
                  {paymentTerms && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Conditions de Paiement
                      </p>
                      <p className="text-sm text-gray-700">{paymentTerms}</p>
                    </div>
                  )}

                  {notes && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{notes}</p>
                    </div>
                  )}

                  {/* Pied de page */}
                  <div className="pt-6 border-t text-center">
                    <p className="text-xs text-gray-500">
                      Merci pour votre confiance. Pour toute question, contactez-nous au{" "}
                      {cooperativeInfo.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>
                Total: <span className="font-bold">{total.toLocaleString("fr-FR")} FCFA</span>
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
              {clientInfo.email && (
                <Button variant="outline" onClick={handleSendEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer par Email
                </Button>
              )}
              <Button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

