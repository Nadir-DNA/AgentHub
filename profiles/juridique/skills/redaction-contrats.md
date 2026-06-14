---
name: redaction-contrats
description: Rédaction et vérification de contrats types pour TPE/PME
triggers:
  - "contrat"
  - "devis"
  - "CGV"
  - "conditions"
---

# Skill : Rédaction contrats

## Quand utiliser ce skill
- Client doit signer un contrat de prestation
- Création de CGV pour le site web
- Demande de devis formalisé
- Bail commercial / location

## Workflow
1. Demander le type de contrat nécessaire
2. Recueillir les informations :
   - Parties (nom, SIRET, adresse)
   - Objet du contrat
   - Durée, prix, conditions
3. Générer le document avec les clauses obligatoires
4. Proposer au client pour relecture
5. Recommander validation par un avocat si montant > 5000€

## Clauses obligatoires (loi française)
- Identité des parties
- Objet du contrat
- Prix et modalités de paiement
- Durée et date d'effet
- Conditions de résiliation
- Clause de confidentialité (si applicable)
- Attribution de compétence (tribunal compétent)
- Loi applicable (droit français)

## Pitfalls
- Ne jamais ajouter de clause abusive (liste noire du Code de la consommation)
- Vérifier que le contrat n'est pas contraire à l'ordre public
- Distinguer B2B et B2C (délais de rétractation différents)
- Toujours recommander une revue par avocat pour les contrats importants
