---
title: Administration
description: Connexion, utilisateurs, mots de passe, paramètres et statistiques
sidebar_position: 5
---

# Administration

## Connexion

- Connexion par nom d'utilisateur (majuscules/minuscules indifférentes) et mot de passe.
- La session dure **12 heures**, puis l'application redemande la connexion.
- Déconnexion : symbole ⎋ à côté du nom d'utilisateur, dans le bandeau.

## Rôles

| Rôle | Droits |
|---|---|
| `user` | agenda, clients, animaux, recherche, statistiques (si activées) |
| `admin` | idem + bouton **Paramètres** : utilisateurs et paramètres de l'application |

## Gestion des utilisateurs (admin)

**Paramètres** → **Gestion des utilisateurs** :

- **Créer** un utilisateur : nom, mot de passe, rôle ;
- **Supprimer** un utilisateur (avec confirmation) ;
- **Réinitialiser un mot de passe** : voir ci-dessous.

Le compte `admin` ne peut être ni supprimé ni réinitialisé depuis cet écran : son mot de passe se
régénère côté serveur (opération d'exploitation).

### Mot de passe oublié

1. L'administrateur clique sur **Réinit. mot de passe** en face de l'utilisateur : un **code
   temporaire à 8 chiffres** s'affiche (une seule fois) et la colonne « Réinit. demandée » passe à *Oui*.
2. Il transmet ce code à l'utilisateur.
3. L'utilisateur se connecte avec son nom et **le code à la place du mot de passe**.
4. L'application lui demande aussitôt de choisir un nouveau mot de passe ; il n'a accès à rien
   d'autre avant. Son ancien mot de passe ne fonctionne plus dès l'étape 1.

## Paramètres de l'application (admin)

| Paramètre | Effet |
|---|---|
| Activer les statistiques | affiche le bouton **Statistiques** dans le bandeau, pour tous les utilisateurs |

## Statistiques

Deux graphiques comparent l'**année en cours** à l'**année précédente** :

- nombre de rendez-vous **par semaine** (S1 à S52) ;
- nombre de rendez-vous **par mois**.
