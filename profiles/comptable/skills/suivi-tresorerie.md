---
name: suivi-tresorerie
description: Suivi quotidien/hebdomadaire de la trésorerie + prévisionnel
triggers:
  - "trésorerie"
  - "solde"
  - "CA"
  - "dépenses"
---

# Skill : Suivi trésorerie

## Quand utiliser ce skill
- Question sur le solde actuel
- Demande de bilan mensuel
- Alerte dépense inhabituelle
- Prévisionnel fin de mois

## Workflow quotidien
1. Récupérer les transactions depuis Qonto/Pennylane
2. Calculer :
   - Solde actuel
   - Entrées du jour
   - Sorties du jour
   - Catégoriser automatiquement (loyer, salaires, achats, etc.)
3. Détecter anomalies :
   - Dépense > 500€ non récurrente
   - Sortie sans facture associée
4. Logger dans mémoire

## Template bilan hebdo (lundi 9h00)
```
💰 Bilan trésorerie semaine {num}

Solde actuel : {solde}€
Entrées semaine : +{entrees}€
Sorties semaine : -{sorties}€

📊 Top 3 dépenses :
1. {cat1} : {montant1}€
2. {cat2} : {montant2}€
3. {cat3} : {montant3}€

⚠️ À vérifier :
{alertes}

Prévisionnel fin de mois : {prev}€
```

## Workflow prévisionnel
1. Récupérer les transactions récurrentes (3 derniers mois)
2. Ajouter les factures en attente (émises + reçues)
3. Projeter sur 30 jours
4. Calculer le "runway" (combien de mois de survie)

## Pitfalls
- Vérifier la date de valeur (pas juste date opération)
- Distinguer TTC vs HT pour les analyses
- Ne pas compter les virements internes comme entrées/sorties
- Alerte si runway < 2 mois
