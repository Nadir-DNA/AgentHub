---
name: gestion-avis-google
description: Réponse automatique aux avis Google (positifs et négatifs)
triggers:
  - "avis"
  - "google"
  - "réputation"
  - "étoiles"
---

# Skill : Gestion avis Google

## Quand utiliser ce skill
- Nouvel avis Google détecté
- Demande de réponse à un avis
- Analyse de la réputation en ligne

## Workflow détection nouvel avis
1. Scraper Google Business Profile (toutes les heures)
2. Identifier les nouveaux avis
3. Pour chaque avis :
   - Analyser le sentiment (positif/négatif/neutre)
   - Proposer une réponse adaptée
   - Envoyer notification au client
4. Attendre validation avant publication

## Template réponse avis positif (4-5 étoiles)
```
Merci {prenom} pour votre retour !

{réponse_personnalisée_selon_contenu}

À bientôt chez {nom_entreprise} !
```

## Template réponse avis négatif (1-2 étoiles)
```
Bonjour {prenom},

Nous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes.

{reconnaissance_du_problème}

Nous aimerions en discuter avec vous pour comprendre ce qui s'est passé et trouver une solution. Pouvez-vous nous contacter au {telephone} ou par email à {email} ?

Cordialement,
{nom_entreprise}
```

## Template réponse avis neutre (3 étoiles)
```
Bonjour {prenom},

Merci pour votre retour.

{réponse_équilibrée}

N'hésitez pas à nous faire part de vos suggestions pour nous améliorer.

À bientôt,
{nom_entreprise}
```

## Analyse sentiment
- **Positif** : mots clés "super", "parfait", "recommande", "accueil", "professionnel"
- **Négatif** : mots clés "déçu", "attente", "problème", "pas", "jamais", "cher"
- **Neutre** : avis court sans émotion forte

## Pitfalls
- Ne JAMAIS répondre à chaud à un avis négatif (attendre validation client)
- Personnaliser chaque réponse (pas de copier-coller générique)
- Mentionner le prénom du client si disponible
- Proposer un contact direct pour les avis négatifs (pas de débat public)
- Signaler les faux avis au client (concurrence déloyale)
