# AWS — Setup básico (Sprint 1)

## 1) Crear cuenta y seguridad
1. Crear cuenta en AWS con tu email.
2. **Activar MFA** en la cuenta root.
3. Crear un **presupuesto (Budget)** de, p. ej., USD 10/mes con alertas por email.

## 2) CLI con SSO (recomendado)
```bash
brew install awscli
aws --version
aws configure sso
# seguí el flujo del navegador y elegí la cuenta/rol
aws sts get-caller-identity
```

> Guardá el perfil como `default` o `tinder-pelis` y documentalo para el equipo.

## 3) S3 Bucket para artefactos
- Crear un bucket con nombre único, por ejemplo: `tinder-pelis-artifacts-<tu-alias>`
- Versionado opcional (puede ser útil).
- Etiquetas: `project=tinder-pelis`, `env=dev`.

## 4) Próximo sprint
- Elegir servicio de deploy para Flask: **App Runner** (simple con Docker) o **Elastic Beanstalk**.
- Parametrizar secretos en **Parameter Store** o **Secrets Manager**.
