# Troubleshooting

Common issues and solutions for DClaw Migrate.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-migrate

# Check logs
kubectl logs -n dclaw-migrate deployment/dclaw-migrate-backend

# Check database
kubectl get clusters -n dclaw-migrate
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
