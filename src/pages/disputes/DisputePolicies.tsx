import { DashboardLayout } from '@/components/common/DashboardLayout';

export default function DisputePolicies() {
  return (
    <DashboardLayout title="Règles et Politiques de Gestion des Litiges" subtitle="Mise à jour le 1er Juillet 2024">
      <div className="prose max-w-3xl">
        <h3>Introduction</h3>
        <p>
          Ce document détaille les règles et politiques relatives à la gestion des litiges au sein de notre plateforme. Il est essentiel que tous les utilisateurs, y compris les marchands, producteurs et coopératives, comprennent ces directives pour assurer une résolution équitable et efficace des conflits.
        </p>
        <h3>Responsabilités des Parties</h3>
        <p>
          Chaque partie impliquée dans une transaction est tenue de respecter les termes et conditions définis. En cas de litige, les parties doivent coopérer pleinement pour fournir toutes les informations et preuves nécessaires à la résolution du problème.
        </p>

        <h3>Procédure de Résolution des Litiges</h3>
        <ol>
          <li>
            <strong>Notification du Litige :</strong> L&apos;utilisateur doit notifier le litige à notre service client dans les plus brefs délais, en fournissant une description détaillée du problème et toutes les preuves pertinentes.
          </li>
          <li>
            <strong>Enquête et Médiation :</strong> Notre équipe procédera à une enquête approfondie et tentera une médiation entre les parties pour trouver une solution amiable.
          </li>
          <li>
            <strong>Décision et Résolution :</strong> Si la médiation échoue, notre service client prendra une décision basée sur les preuves fournies et les termes et conditions applicables. La décision sera contraignante pour les deux parties.
          </li>
        </ol>

        <h3>Délais de Résolution</h3>
        <p>
          Nous nous engageons à résoudre les litiges dans un délai maximum de 30 jours ouvrables à compter de la notification. Ce délai peut varier en fonction de la complexité du litige et de la disponibilité des informations.
        </p>

        <h3>Recours Possibles</h3>
        <p>
          En cas de désaccord avec la décision de notre service client, les parties peuvent faire appel à une instance supérieure au sein de notre organisation. Si le litige persiste, les parties peuvent recourir à des voies légales conformément à la législation en vigueur.
        </p>

        <h3>Modifications des Politiques</h3>
        <p>
          Nous nous réservons le droit de modifier ces règles et politiques à tout moment. Les utilisateurs seront informés de toute modification importante, et la version la plus récente sera toujours disponible sur notre plateforme.
        </p>
      </div>
    </DashboardLayout>
  );
}

