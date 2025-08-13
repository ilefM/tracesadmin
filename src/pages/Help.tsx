export default function Help() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl underline mb-6">Guide d'utilisation</h1>

      <section className="mb-8 text-">
        <h2 className="text-xl font-semibold">Exploration des données</h2>
        <p className="mt-2">
          Depuis la page d’accueil, vous pouvez explorer les données de deux
          manières :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            En naviguant dans la <strong>liste des données</strong> affichée
            sous forme de tableau.
          </li>
          <li>
            En utilisant la <strong>barre de recherche</strong> pour trouver
            rapidement une commune ou un personnage après avoir tapé au moins 3
            lettres.
          </li>
        </ul>
        <p className="mt-2">
          Il existe deux modes de visualisation : <em>Communes/Villes</em> et{" "}
          <em>Pionniers</em>. Utilisez le bouton de bascule pour passer de l’un
          à l’autre.
        </p>

        <h3 className="text-lg font-medium mt-4">Filtres disponibles</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            Vous pouvez filtrer par <strong>département</strong> ou par{" "}
            <strong>commune</strong>.
          </li>
          <li>
            Lors du filtrage par département, il est recommandé de taper
            <strong>le code du département</strong> (exemple : 11 pour l’Aude)
            afin d’éviter que le filtre corresponde à d’autres noms de
            départements contenant ce texte.
          </li>
          <li>
            Dans le champ de filtre « commune », vous pouvez utiliser la clé{" "}
            <strong>lieu=aucun</strong> pour afficher uniquement les pionniers
            qui ne sont associés à <strong>aucune commune/ville</strong>.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold">Utilisation de la recherche</h2>
        <p className="mt-2">
          La recherche affiche des suggestions dès que vous tapez au moins 3
          caractères. Cliquez sur une suggestion pour ouvrir directement la
          fiche détaillée de la données en question.
        </p>
        <p className="mt-2">
          Vous pouvez également cliquer sur une ligne du tableau de données pour
          accéder aux détails.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold">Page de détails</h2>
        <p className="mt-2">
          Les pages de détails vous permettent de consulter toutes les
          informations disponibles sur une commune/ville ou un pionnier : nom,
          description, lieu, biographie, etc.
        </p>
        <p className="mt-2">
          Si vous êtes connecté avec un compte vous verrez un bouton{" "}
          <strong>« Éditer »</strong> qui permet de modifier les informations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold">Édition des données</h2>
        <p className="mt-2">
          En mode édition, vous pouvez modifier les champs de la fiche. Une fois
          vos changements effectués, cliquez sur{" "}
          <strong>« Sauvegarder »</strong> pour enregistrer.
        </p>

        <h3 className="text-lg font-medium mt-4">Pour les pionniers</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            Seul le <strong>nom</strong> est requis.
          </li>
          <li>
            Si vous connaissez le <strong>lieu de provenance</strong>, il est{" "}
            <strong>important de renseigner le code INSEE</strong>. Un pionnier
            avec un code INSEE incorrect (inexistant dans la base des
            communes/villes) ne sera pas accepté.
          </li>
          <li>
            Assurez-vous de mettre le bon code INSEE car le pionnier sera lié à
            la commune/ville correspondante. Dans le cas où vous vous êtes
            trompé et que l’entrée a été acceptée, vous pouvez rechercher le
            pionnier en question et re-modifier le formulaire.
          </li>
          <li>
            Cochez la case <strong>Personnage majeur</strong> si c’est le cas ;
            sinon laissez la case vide.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-4">Pour les communes / villes</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            Vous ne pouvez pas supprimer une commune si elle a des personnages
            associés. Il faut d’abord retirer le code INSEE de chaque pionnier
            lié, puis revenir à la commune pour la supprimer.
          </li>
        </ul>

        <p className="mt-2 text-sm text-gray-600">
          L’édition, la suppression ou l’ajout de données nécessite d’être
          connecté et autorisé.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold">
          Ajout / Téléversement de données
        </h2>
        <p className="mt-2">
          Si vous disposez des droits nécessaires, vous pouvez importer ou
          ajouter manuellement de nouvelles communes/villes et personnages via
          l’outil de téléversement.
        </p>

        <p className="mb-2">
          Le processus de <strong>batchInsertTowns</strong> suit les étapes
          suivantes :
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>
            Après vérification du format Excel, chaque ligne est analysée.
          </li>
          <li>
            Si un code INSEE est déjà présent dans la base, l'insertion est{" "}
            <strong>ignorée</strong>. Sinon, la ligne est insérée.
          </li>
          <li>
            <strong>IMPORTANT:</strong> Pour les villes et provinces du Canada,
            le code postal doit être renseigné dans la colonne{" "}
            <strong>code INSEE</strong>.
          </li>
          <li>
            Assurez-vous que le département existe déjà dans la base afin
            d’éviter les erreurs de département (orthographe et code corrects).
          </li>
          <li>
            Si la position géographique n’est pas connue, laissez les cellules
            correspondantes vides.
          </li>
          <li>
            Le <strong>code INSEE</strong> doit absolument être rempli.
          </li>
          <li>Ne changez pas les titres des en-têtes dans le fichier Excel.</li>
          <li>
            Chaque gabarit Excel contient un exemple à la ligne 2. Veuillez
            supprimer cette ligne avant de remplir vos données. Cet exemple est
            uniquement là pour montrer le format attendu dans chaque cellule.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Astuces</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Utilisez la recherche pour gagner du temps.</li>
          <li>
            Filtrez les données dans le tableau pour n’afficher que ce qui vous
            intéresse.
          </li>
          <li>
            Pensez à vérifier que vous êtes connecté si le bouton « Éditer »
            n’apparaît pas.
          </li>
        </ul>
      </section>
    </div>
  );
}
