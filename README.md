# 🔧 Lodash as a Service

Un service web simple qui vous permet d'exécuter des transformations Lodash via des requêtes HTTP. Ce service est conçu pour les scénarios no-code où vous avez besoin d'effectuer des transformations de données simples sans écrire de code.

## 🎯 Pourquoi ce service existe

Lodash fournit des fonctions utilitaires puissantes pour les tâches de programmation courantes. Ce service rend ces fonctions accessibles via de simples requêtes HTTP, permettant :

- **Transformations de données no-code** : Idéal pour les outils d'automatisation comme Zapier, Make, etc.
- **Manipulations rapides** : String/array/object sans environnement de développement
- **Intégration facile** : Via HTTP avec n'importe quel service
- **Traitement de données simplifié** : Dans les workflows d'automatisation

## ⚡ Comment ça fonctionne

Le service utilise une structure d'URL claire où chaque segment de chemin représente une méthode Lodash. Les méthodes sont appliquées dans l'ordre où elles apparaissent dans l'URL.

### 🔗 Transformations simples (GET)

Pour les transformations simples sans arguments de méthode :

```bash
GET /{method1}/{method2}/...?input=value
```

**Exemples :**

```bash
# Convertir en camelCase
GET /camelCase?input=hello_world
→ Résultat: "helloWorld"

# Chaîner plusieurs transformations
GET /trim/toLower/camelCase/upperFirst?input=  HELLO_WORLD  
→ Résultat: "HelloWorld"

# Nettoyer un tableau
GET /compact?input=[1,null,2,"",3,false,4]
→ Résultat: [1,2,3,4]
```

### 🚀 Transformations complexes (POST)

Pour les transformations nécessitant des arguments :

```bash
POST /{method1}/{method2}/...
Content-Type: application/json

{
  "input": "value",
  "args": [
    [/* args for method1 */],
    [/* args for method2 */]
  ]
}
```

**Exemple :**

```bash
POST /replace/toUpper
Content-Type: application/json

{
  "input": "hello world",
  "args": [
    [" ", "-"],  # args pour replace
    []           # args pour toUpper (aucun)
  ]
}
→ Résultat: "HELLO-WORLD"
```

## 🛠 Installation locale

### Prérequis

- Node.js (v18 ou plus récent)
- npm

### Installation

1. **Cloner le repository :**
   ```bash
   git clone https://github.com/votre-username/lodash-as-a-service.git
   cd lodash-as-a-service
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

Le service sera disponible sur `http://localhost:3000`

### 🐳 Avec Docker

```bash
docker build -t lodash-service .
docker run -p 3000:3000 lodash-service
```

## 📖 Exemples d'utilisation

### Avec HTTPie

**GET simple :**
```bash
http GET localhost:3000/trim/camelCase input=='  hello_world  '
```

**POST complexe avec jo :**
```bash
jo input='hello world' args=$(jo -a $(jo -a ' ' '-')) | http POST localhost:3000/replace/toUpper
```

### Avec curl

**GET simple :**
```bash
curl 'localhost:3000/trim/camelCase?input=  hello_world  '
```

**POST complexe :**
```bash
curl -X POST localhost:3000/replace/toUpper \
  -H 'Content-Type: application/json' \
  -d '{"input":"hello world","args":[[" ","-"],[]]}'
```

## 🔒 Sécurité

- **Whitelist stricte** : Seules les méthodes Lodash sûres sont autorisées
- **Rate limiting** : Protection contre l'abus (100 requêtes/minute)
- **Validation d'entrée** : Prévention d'injection de code
- **Timeout** : 1 seconde max par opération
- **Pas d'exécution de code** : Seulement des appels de méthodes prédéfinies

### Méthodes autorisées

Les méthodes suivantes sont disponibles :

**String :** camelCase, capitalize, deburr, kebabCase, lowerCase, snakeCase, startCase, trim, truncate, upperCase, upperFirst, etc.

**Array :** compact, concat, difference, drop, flatten, head, intersection, join, last, reverse, slice, uniq, without, etc.

**Object :** keys, values, entries, omit, pick, invert

[Voir la liste complète sur `/`]

## 🚀 Déploiement sur Fly.io

1. **Installer le CLI Fly :**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Se connecter :**
   ```bash
   fly auth login
   ```

3. **Lancer l'app :**
   ```bash
   fly launch
   ```

4. **Déployer les mises à jour :**
   ```bash
   fly deploy
   ```

## 🎨 Cas d'usage

### No-code automation
- Zapier/Make workflows
- Transformation de données entre services
- Nettoyage de données en temps réel

### API intégration
- Middleware de transformation
- Normalisation de données
- Format de sortie personnalisé

### Prototypage rapide
- Test de transformations
- Validation de données
- Scripts d'utilitaires

## 📊 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/` | GET | Documentation interactive |
| `/{methods}` | GET | Transformations simples |
| `/{methods}` | POST | Transformations avec args |
| `/health` | GET | Vérification santé |

## 🤝 Contribuer

1. Fork le project
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## ⚠️ Notes importantes

- **Process crashes** : Sur Fly.io, si un process crash (impossible avec notre whitelist), il redémarre automatiquement
- **Performance** : Chaque opération a un timeout de 1 seconde
- **Limites** : 100 requêtes par minute par IP
- **Sécurité** : Aucun code arbitraire n'est exécuté
