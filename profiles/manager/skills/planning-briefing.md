---
name: planning-briefing
description: Briefing quotidien du planning + optimisation
triggers:
  - "planning"
  - "briefing"
  - "agenda"
---

# Skill : Planning & Briefing

## Quand utiliser ce skill
- Matin : briefing du jour
- Soir : bilan de la journée
- À la demande : "Qui est le prochain ?", "Planning de demain ?"

## Workflow briefing matin (9h00)
1. Récupérer les RDV du jour depuis l'agenda
2. Calculer :
   - Nombre de RDV
   - Taux de remplissage
   - CA prévisionnel
   - Temps morts (trous > 1h)
3. Envoyer le briefing via WhatsApp + notification app

## Template briefing matin
```
☀️ Briefing du {date}

📊 {nb_rdv} RDV aujourd'hui
💰 CA prévisionnel : {ca}€
📈 Taux de remplissage : {taux}%

⏰ Prochain RDV :
{heure} — {client} ({prestation})

⚠️ Attention :
{alertes} (trous, surcharge, clients VIP)

Bonne journée !
```

## Workflow bilan soir (18h00)
1. Récupérer les RDV effectués
2. Comparer prévisionnel vs réel
3. Identifier :
   - No-shows
   - Retards
   - Upsells réussis
4. Envoyer le bilan

## Template bilan soir
```
🌙 Bilan du {date}

✅ {nb_effectues}/{nb_prevus} RDV effectués
💰 CA réel : {ca_reel}€ (prévu : {ca_prevu}€)

📈 Points forts :
{points_forts}

⚠️ À améliorer :
{ameliorations}

À demain !
```

## Pitfalls
- Ne pas envoyer de briefing si 0 RDV (inutile)
- Adapter les métriques selon le métier (coiffeur = taux remplissage, avocat = heures facturées)
- Stocker les bilans pour trending hebdomadaire
