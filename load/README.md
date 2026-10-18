# Pruebas de estrés

`stress.js` sube el tráfico público (inicio, simulador, escenario compartido, explicaciones, imagen OG y sesión) hasta `PEAK_VUS` usuarios virtuales durante unos 9 minutos. Se niega a ejecutarse contra cualquier host que no sea local, para no tocar producción.

## Ejecución

Requiere [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) y Docker.

```sh
# Base de datos desechable de los tests e2e (nunca la de .env.local)
pnpm test:e2e:db

# Build de producción contra esa base de datos
pnpm build
DATABASE_URI=postgres://postgres:postgres@db.localtest.me:5432/main \
BETTER_AUTH_URL=http://localhost:3100 \
BETTER_AUTH_SECRET=e2e-placeholder-secret-not-used-in-production \
RESEND_API_KEY= \
pnpm start --port 3100

# En otra terminal
pnpm test:stress
PEAK_VUS=500 pnpm test:stress          # más carga
BASE_URL=http://127.0.0.1:3000 pnpm test:stress

# Al terminar
pnpm test:e2e:db:down
```

Sin k6 instalado: `docker run --rm -i --network host -e BASE_URL grafana/k6 run - < load/stress.js`.

Los umbrales (errores < 1 %, p95 < 1,5 s, p95 de la imagen OG < 3 s) hacen que k6 termine con error si se superan.
