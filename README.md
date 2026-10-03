# Canicoif

Application web de gestion des rendez-vous pour salon de toilettage : agenda hebdomadaire,
fiches clients et animaux, historique des soins, statistiques. Données dans une base MongoDB
locale.

![Agenda de la semaine](docs/img/Canicoif-Accueil.png)

**Documentation d'utilisation : [`docs/`](docs/index.md)**

## Stack

React (Vite) + Express + MongoDB, authentification JWT. Distribuée en image Docker
(`mathmath350/canicoif`) ; [`docker-compose.yml`](docker-compose.yml) donne un déploiement type
(l'app exige `JWT_SECRET` dans l'environnement).

## Développement

```bash
make help   # commandes disponibles
make dev    # backend :8000 + frontend Vite :5173
```

Tests de l'API : `npm test` dans `backend/`.
