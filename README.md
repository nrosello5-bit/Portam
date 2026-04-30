# Porta'm — Delivery local a L'Ametlla del Vallès

## Posada en marxa

### 1. Instal·lar dependències
```bash
npm install
```

### 2. Configurar variables d'entorn
```bash
cp .env.local.example .env.local
# Edita .env.local amb les teves claus
```

### 3. Configurar Supabase
1. Crea un projecte a [supabase.com](https://supabase.com)
2. Executa `supabase/migrations/001_initial.sql` al SQL Editor
3. Executa `supabase/seed.sql` (actualitza els UUIDs dels usuaris primer)
4. Copia URL i claus a `.env.local`

### 4. Configurar Stripe (opcional per al MVP)
1. Crea un compte a [stripe.com](https://stripe.com)
2. Copia les claus de prova a `.env.local`

### 5. Executar en local
```bash
npm run dev
```
Obre [http://localhost:3000](http://localhost:3000)

## Estructura

```
app/
├── (client)/           # App clients
│   ├── page.tsx        # Inici — llistat comerços
│   ├── shop/[id]/      # Detall comerç + productes
│   ├── cart/           # Cistella + checkout
│   ├── order/[id]/     # Seguiment comanda (realtime)
│   └── profile/        # Perfil + historial
├── (merchant)/         # Panel comerç
│   └── merchant/       # Dashboard comandes
├── (rider)/            # App repartidor
│   └── rider/          # Dashboard repartidor
├── auth/               # Login / Registre
└── api/                # API routes
    ├── orders/
    └── webhooks/stripe/

components/
├── client/             # Components de l'app client
├── merchant/           # Components del panel
└── rider/              # Components del repartidor

supabase/
├── migrations/001_initial.sql   # Schema BD
└── seed.sql                     # Dades d'exemple
```

## URLs per rol

| Rol | URL |
|-----|-----|
| Client | `/` |
| Merchant | `/merchant` |
| Rider | `/rider` |

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (BD + Auth + Realtime)
- **Stripe** (pagaments)
- **next-intl** (ca / es)
- **PWA** (manifest + service worker)
