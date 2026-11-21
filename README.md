git # Student Management Demo

A teaching-oriented three-tier app with a React 18/Vite UI, a Spring Boot REST API, MySQL on Kubernetes, and an AWS Application Load Balancer provisioned by Kubernetes Ingress.

## Project layout

```text
backend/    Spring Boot CRUD API and MySQL integration
frontend/   React/Vite student management page
k8s/
  database/ Secret, PersistentVolumeClaim, Service, StatefulSet (one Kubernetes kind per file)
  backend/  ConfigMap, Deployment, Service (one Kubernetes kind per file)
  frontend/ Deployment and Service (one Kubernetes kind per file)
  *.yaml    Shared Namespace, Secret, ConfigMap, and AWS Ingress resources
```

## Prerequisites

- Docker
- Docker Compose
- Java 17 and Maven (optional for local source builds)
- Node.js 20 and npm (optional for local source builds)
- An AWS EKS cluster with AWS Load Balancer Controller installed and configured with the required IAM permissions
- `kubectl` configured for that EKS cluster

## Run locally with Docker Compose

From the project root, build and start MySQL, the backend, and the frontend:

```powershell
Copy-Item .env.example .env
# Edit .env and replace demo credentials before using real data.
docker compose up --build -d
docker compose ps
```

On Linux, use `cp .env.example .env` instead of `Copy-Item`.

Open `http://localhost`. The frontend proxies `/api` requests to `backend-service`; Compose configures that name as a backend network alias, and Kubernetes provides it as a Service. MySQL data is kept in the `mysql-data` volume. Docker Compose reads the database and host-port settings from `.env`; `.env` is ignored by Git. The example credentials are for local demonstration only—replace them with strong values before using real data.

Stop the services with `docker compose down`. To also remove the stored database data, run `docker compose down --volumes`.

## Build images

Run these commands from the project root:

```powershell
docker build -t student-backend:1.0 .\backend
docker build -t student-frontend:1.0 .\frontend
```

Push both images to a container registry accessible by EKS (for example, Amazon ECR), and update the two image references in the Kubernetes Deployment manifests if needed.

Optional source builds:

```powershell
mvn -f .\backend\pom.xml clean package
npm --prefix .\frontend install
npm --prefix .\frontend run build
```

## Deploy to EKS

The Secret in `k8s/database/secret.yaml` contains clearly labeled, demo-only credentials encoded as base64; base64 is not encryption. Replace them before deploying, or create the Secret securely through your deployment process. Generate replacement values in PowerShell with:

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('your-value'))
```

Update all four `data` values in that file before using non-demo credentials. Apply the manifests from the project root in dependency order:

```powershell
kubectl apply -f .\k8s\00-namespace.yaml
kubectl apply -f .\k8s\database\secret.yaml
kubectl apply -f .\k8s\database\persistent-volume-claim.yaml
kubectl apply -f .\k8s\database\service.yaml
kubectl apply -f .\k8s\database\statefulset.yaml
kubectl apply -f .\k8s\backend\configmap.yaml
kubectl apply -f .\k8s\backend\service.yaml
kubectl apply -f .\k8s\backend\deployment.yaml
kubectl apply -f .\k8s\frontend\configmap.yaml
kubectl apply -f .\k8s\frontend\service.yaml
kubectl apply -f .\k8s\frontend\deployment.yaml
kubectl apply -f .\k8s\ingress.yaml
```

Check rollout and storage status:

```powershell
kubectl get pods,svc,pvc -n student-demo
kubectl rollout status deployment/backend -n student-demo
kubectl rollout status deployment/frontend -n student-demo
kubectl get ingress -n student-demo
```

Wait for the ALB hostname to appear, then open it in a browser:

```powershell
kubectl get ingress student-demo -n student-demo -w
```

Ingress sends `/` to the frontend and `/api` to the backend. Both Services remain ClusterIP; the AWS ALB is the only public entry point.

## API smoke check

With the ALB hostname reachable:

```powershell
$appUrl = "http://<ALB-hostname>"
Invoke-RestMethod "$appUrl/api/info"
Invoke-RestMethod "$appUrl/api/students"
Invoke-RestMethod -Method Post -Uri "$appUrl/api/students" `
  -ContentType 'application/json' `
  -Body '{"name":"Ada Lovelace","email":"ada@example.com","course":"Computing"}'
```

The page also shows the backend pod hostname from `/api/info`, and its refresh button can sample another request.

## Teaching exercises

1. **Internal DNS:** enter a backend pod and look up the database service:
   `kubectl exec -it <backend-pod> -n student-demo -- nslookup mysql-service`
2. **Replica load balancing:** scale the backend and refresh the pod display:
   `kubectl scale deployment/backend --replicas=3 -n student-demo`
3. **Persistent data:** delete the MySQL pod and confirm its student rows remain after it restarts:
   `kubectl delete pod mysql-0 -n student-demo`
4. **ConfigMap update:** edit `app-config`, then restart the deployment that consumes the changed setting:
   `kubectl edit configmap app-config -n student-demo`
5. **Service isolation:** inspect service types and confirm `frontend-service` and `backend-service` are ClusterIP; public traffic enters through the AWS ALB Ingress.

## Clean up

```powershell
kubectl delete namespace student-demo
```

Persistent volume reclamation depends on the cluster's StorageClass reclaim policy. AWS resource creation and image publication time are additional to the application deployment steps.
