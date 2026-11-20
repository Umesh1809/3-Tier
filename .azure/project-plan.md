# Student Management Demo

## Goal

Create a small, teaching-oriented three-tier student management application exposed through an AWS-managed Kubernetes Application Load Balancer.

## Architecture

- Namespace: `student-demo`.
- Browser traffic enters through an AWS Application Load Balancer provisioned by AWS Load Balancer Controller from a Kubernetes Ingress.
- Ingress routes `/` to `frontend-service` and `/api` to `backend-service`.
- React frontend uses relative `/api/...` URLs.
- Spring Boot backend accesses MySQL through `mysql-service.student-demo.svc.cluster.local:3306`.
- Frontend and backend Kubernetes services are ClusterIP; MySQL uses a headless service.
- Do not create or retain a Spring Cloud Gateway application module.

## Stack and features

- Frontend: React 18, Vite, JavaScript, and fetch; one page with student list, add/edit form, delete action, and a displayed backend pod hostname from `/api/info`.
- Backend: Java 17, Spring Boot 3, Maven, Spring Web, Spring Data JPA, MySQL driver, and Actuator. Implement `Student` CRUD (`id`, `name`, `email`, `course`) with controller/service/repository layers and `/api/info`.
- Backend configuration reads datasource URL/credentials from environment variables, uses `ddl-auto=update`, exposes liveness/readiness probes, and retries/waits for MySQL startup.
- Keep code straightforward and add brief educational comments where useful. Do not hard-code passwords or frontend backend hostnames.

## Containers and Kubernetes

- Multi-stage Docker builds: Node 20 Alpine to Nginx Alpine for frontend; Maven 3.9 with Temurin 17 to Temurin 17 JRE Alpine for backend. Run as non-root where practical and add module-specific `.dockerignore` files.
- Image tags: `student-frontend:1.0` and `student-backend:1.0`.
- Organize Kubernetes manifests by tier: `k8s/database/`, `k8s/backend/`, and `k8s/frontend/`. Store the MySQL Secret in `k8s/database/secret.yaml` and the backend application ConfigMap in `k8s/backend/configmap.yaml`; keep the Namespace and AWS ALB Ingress manifests at the `k8s/` root. Put each Kubernetes resource kind in its own YAML file.
- MySQL has one replica, 1Gi persistent storage, credentials from Secret, and a `mysqladmin ping` readiness probe.
- Backend has two replicas, health probes, resource requests/limits, and configuration from ConfigMap/Secret. Frontend has two replicas, probes, and resource limits. The Ingress uses class `alb`, provisions an internet-facing ALB, and routes requests to the internal services with service-specific health checks.
- Use consistent `app`/`tier` labels, student-facing comments in manifests, and no secret values in ConfigMaps or source.

## Documentation and delivery order

Create `backend/`, `frontend/`, `k8s/`, and root `README.md`. Do not include an app gateway module. Implement in this order: backend, frontend, Dockerfiles, Kubernetes manifests, README.

README must explain AWS EKS and AWS Load Balancer Controller prerequisites, building images, applying the per-kind manifests in dependency order, checking pods/services/PVCs/Ingress, and opening the ALB address. Include teaching exercises for internal DNS, scaling backend replicas and observing pod identity, PVC persistence, ConfigMap updates, and ClusterIP isolation. Keep the clean-start walkthrough suitable for completion in under 15 minutes.

## Acceptance checks

- Backend exposes the five CRUD routes and `/api/info`; frontend performs CRUD through the Ingress using relative URLs.
- Only the AWS ALB Ingress is externally reachable; it routes to the internal frontend/backend services.
- Database configuration uses the specified internal DNS and Kubernetes Secret; no password is hard-coded.
- Manifests provide health probes, PVC, replicas, resource controls, and AWS ALB routing.
- Build/test commands and local validation are run where available; document any validations requiring a Kubernetes cluster.
