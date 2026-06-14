---
name: gestion-factures
description: Création, envoi et suivi des factures clients
triggers:
  - "facture"
  - "devis"
  - "paiement"
---

# Skill : Gestion factures

## Quand utiliser ce skill
- Créer une nouvelle facture
- Envoyer une facture à un client
- Relancer un impayé
- Générer un devis

## Workflow création facture
1. Demander les infos :
   - Client (nom, email, SIRET si pro)
   - Prestations (description, quantité, prix unitaire)
   - TVA applicable (20%, 10%, 5.5%, exonéré)
2. Calculer :
   - Total HT
   - Montant TVA
   - Total TTC
3. Générer PDF avec template
4. Envoyer par email + WhatsApp
5. Logger dans mémoire (statut : envoyée)

## Template facture
```
FACTURE #{numero}
Date : {date}
Échéance : {date_echeance}

Client : {nom_client}
{adresse_client}

Prestations :
{prestations_table}

Total HT : {total_ht}€
TVA ({taux}%) : {tva}€
Total TTC : {total_ttc}€

Merci de régler par virement :
IBAN : {iban}
```

## Workflow relance impayé
1. Identifier factures en retard (> date échéance)
2. Pour chaque facture :
   - J+7 : relance email amicale
   - J+15 : relance WhatsApp
   - J+30 : mise en demeure email
3. Logger chaque relance

## Template relance J+7
```
Bonjour {prenom},

Sauf erreur de notre part, nous n'avons pas reçu le règlement de votre facture #{numero} du {date} ({montant}€).

Pouvez-vous vérifier de votre côté ?

Merci,
{nom_entreprise}
```

## Pitfalls
- Toujours vérifier le numéro de facture (séquentiel, sans trou)
- Mentionner les pénalités de retard (obligatoire)
- Conserver une copie de chaque facture (10 ans)
- Adapter le taux TVA selon l'activité
