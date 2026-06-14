---
name: relance-clients
description: Relance automatique des clients (J-1, post-prestation, impayés)
triggers:
  - "relance"
  - "client"
  - "rappel"
---

# Skill : Relance clients

## Quand utiliser ce skill
- Client a un RDV demain → relance J-1
- Client n'est pas venu → relance post-absence
- Facture impayée depuis 7 jours → relance paiement

## Workflow
1. Interroger l'agenda (Planity/Doctolib) pour les RDV de demain
2. Pour chaque RDV :
   - Vérifier si le client a déjà reçu une relance
   - Si non → envoyer message WhatsApp/Telegram
3. Logger la relance dans la mémoire

## Template message J-1
```
Bonjour {prenom},

Petit rappel : votre RDV est prévu demain à {heure} pour {prestation}.

À demain !
{nom_entreprise}
```

## Template message absence
```
Bonjour {prenom},

Nous n'avons pas pu vous accueillir aujourd'hui. Souhaitez-vous reprogrammer votre RDV ?

{nom_entreprise}
```

## Template message impayé
```
Bonjour {prenom},

Sauf erreur de notre part, nous n'avons pas reçu le règlement de votre facture du {date} ({montant}€).

Pouvez-vous vérifier de votre côté ?

Merci,
{nom_entreprise}
```

## Pitfalls
- Ne pas relancer plus de 2 fois par semaine
- Vérifier que le numéro WhatsApp est valide
- Adapter le ton selon le type de client (fidèle vs nouveau)
