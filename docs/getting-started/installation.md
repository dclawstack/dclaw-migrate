# Installation

## Via DPanel

1. Open DPanel at `https://panel.yourdomain.com`
2. Find **DClaw Migrate** in the app grid
3. Click **Install**
4. The DClaw Operator will provision:
   - Namespace: `dclaw-migrate`
   - Frontend deployment (Next.js)
   - Backend deployment (FastAPI)
   - PostgreSQL database (CloudNativePG)
   - Ingress with TLS

## Via kubectl

```bash
# Apply the DClawApp CRD
kubectl apply -f - <<EOF
apiVersion: platform.dclaw.io/v1
kind: DClawApp
metadata:
  name: migrate
spec:
  appId: migrate
  appName: DClaw Migrate
  version: 0.1.0
  category: infrastructure
  enabled: true
  frontend:
    image: ghcr.io/dclawstack/dclaw-migrate:latest
    replicas: 2
  backend:
    image: ghcr.io/dclawstack/dclaw-migrate-backend:latest
    replicas: 2
  database:
    enabled: true
    storage: 10Gi
  ingress:
    enabled: true
    host: migrate.yourdomain.com
    tls: true
EOF
```

## Verify

```bash
kubectl get pods -n dclaw-migrate
kubectl get ingress -n dclaw-migrate
```
