# Backup Automático — Guia de Setup por Projeto

Backup completo em duas partes:
- **Firestore** → exportado para Google Cloud Storage (GCS) via Cloud Scheduler
- **Imagens R2** → sincronizadas para o mesmo bucket GCS via Cloud Run Job + Rclone

Resultado: um único bucket GCS com todo o estado do sistema (dados + imagens), rodando automaticamente toda semana.

---

## Pré-requisitos

- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) instalado e autenticado
- Acesso ao projeto Firebase/GCP do cliente
- Credenciais do Cloudflare R2 do projeto (Account ID, Access Key, Secret Key, Bucket Name)

---

## ORTEGA BARBER — Project ID: `ortegabarber-21668`

### Passo 1 — Variáveis do projeto

```bash
PROJECT_ID="ortegabarber-21668"
REGION="southamerica-east1"
BUCKET_BACKUP="gs://ortegabarber-backup"
R2_BUCKET="ortega-images"
```

### Passo 2 — Autenticar e configurar projeto

```bash
gcloud auth login
gcloud config set project $PROJECT_ID
```

### Passo 3 — Ativar APIs necessárias

```bash
gcloud services enable \
  firestore.googleapis.com \
  cloudscheduler.googleapis.com \
  run.googleapis.com \
  cloudresourcemanager.googleapis.com
```

### Passo 4 — Criar bucket de backup no GCS

```bash
gcloud storage buckets create $BUCKET_BACKUP \
  --project=$PROJECT_ID \
  --location=$REGION \
  --uniform-bucket-level-access
```

### Passo 5 — Dar permissão ao Firestore para exportar para o bucket

```bash
# Pega o service account padrão do Firestore
SA="service-$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@gcp-sa-firestore.iam.gserviceaccount.com"

gcloud storage buckets add-iam-policy-binding $BUCKET_BACKUP \
  --member="serviceAccount:$SA" \
  --role="roles/storage.admin"
```

### Passo 6 — Criar Cloud Scheduler para export do Firestore (toda segunda às 03h)

```bash
gcloud scheduler jobs create http firestore-backup-weekly \
  --schedule="0 3 * * 1" \
  --time-zone="America/Sao_Paulo" \
  --uri="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):exportDocuments" \
  --message-body="{\"outputUriPrefix\": \"${BUCKET_BACKUP}/firestore\"}" \
  --oauth-service-account-email="$(gcloud config get-value account)" \
  --location=$REGION
```

### Passo 7 — Criar Cloud Run Job para backup das imagens R2 → GCS (Rclone)

**7a. Criar arquivo de configuração do Rclone**

Crie um arquivo `rclone.conf` localmente (não commitar):

```ini
[r2]
type = s3
provider = Cloudflare
access_key_id = SEU_R2_ACCESS_KEY_ID
secret_access_key = SEU_R2_SECRET_ACCESS_KEY
endpoint = https://SEU_CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

[gcs]
type = google cloud storage
project_number = SEU_PROJECT_NUMBER
```

**7b. Criar Secret no Google Secret Manager com o rclone.conf**

```bash
gcloud secrets create rclone-config-ortega \
  --data-file=rclone.conf \
  --project=$PROJECT_ID
```

**7c. Criar o Cloud Run Job**

```bash
gcloud run jobs create r2-backup-ortega \
  --image=rclone/rclone:latest \
  --region=$REGION \
  --project=$PROJECT_ID \
  --set-secrets="/config/rclone.conf=rclone-config-ortega:latest" \
  --args="sync,r2:ortega-images,gcs:ortegabarber-backup/r2-images,--config,/config/rclone.conf,--progress"
```

**7d. Agendar o Cloud Run Job (toda segunda às 03h30, após o Firestore)**

```bash
gcloud scheduler jobs create http r2-backup-weekly \
  --schedule="30 3 * * 1" \
  --time-zone="America/Sao_Paulo" \
  --uri="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/r2-backup-ortega:run" \
  --oauth-service-account-email="$(gcloud config get-value account)" \
  --location=$REGION
```

### Passo 8 — Testar manualmente

```bash
# Testar export do Firestore agora
gcloud scheduler jobs run firestore-backup-weekly --location=$REGION

# Testar backup do R2 agora
gcloud run jobs execute r2-backup-ortega --region=$REGION
```

### Passo 9 — Verificar resultado

```bash
gcloud storage ls $BUCKET_BACKUP/firestore/
gcloud storage ls $BUCKET_BACKUP/r2-images/
```

---

## NYX — Prompt para o Vitor

**Passar este bloco para o Vitor rodar no projeto da Nyx:**

---

> **Vitor — setup de backup automático da Nyx**
>
> Rode os comandos abaixo no terminal com o `gcloud` autenticado na conta do projeto Firebase da Nyx.
>
> Você vai precisar ter em mãos:
> - Project ID do Firebase da Nyx (ex: `nyx-xxxxx`)
> - Account ID do Cloudflare (painel Cloudflare → lado direito da tela inicial)
> - Access Key ID e Secret Access Key do R2 (Cloudflare → R2 → Manage R2 API Tokens)
> - Nome do bucket R2 da Nyx (ex: `nyx-images`)
>
> ```bash
> # 1. Substitua os valores abaixo antes de rodar
> PROJECT_ID="SEU_PROJECT_ID_DA_NYX"
> REGION="southamerica-east1"
> BUCKET_BACKUP="gs://nyx-backup"
> CLOUDFLARE_ACCOUNT_ID="SEU_ACCOUNT_ID"
> R2_ACCESS_KEY="SEU_R2_ACCESS_KEY_ID"
> R2_SECRET_KEY="SEU_R2_SECRET_ACCESS_KEY"
> R2_BUCKET="nyx-images"
>
> # 2. Autenticar
> gcloud auth login
> gcloud config set project $PROJECT_ID
>
> # 3. Ativar APIs
> gcloud services enable \
>   firestore.googleapis.com \
>   cloudscheduler.googleapis.com \
>   run.googleapis.com
>
> # 4. Criar bucket de backup
> gcloud storage buckets create $BUCKET_BACKUP \
>   --project=$PROJECT_ID \
>   --location=$REGION \
>   --uniform-bucket-level-access
>
> # 5. Permissão Firestore → bucket
> SA="service-$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@gcp-sa-firestore.iam.gserviceaccount.com"
> gcloud storage buckets add-iam-policy-binding $BUCKET_BACKUP \
>   --member="serviceAccount:$SA" \
>   --role="roles/storage.admin"
>
> # 6. Agendar export do Firestore (toda segunda às 03h)
> gcloud scheduler jobs create http firestore-backup-weekly \
>   --schedule="0 3 * * 1" \
>   --time-zone="America/Sao_Paulo" \
>   --uri="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default):exportDocuments" \
>   --message-body="{\"outputUriPrefix\": \"${BUCKET_BACKUP}/firestore\"}" \
>   --oauth-service-account-email="$(gcloud config get-value account)" \
>   --location=$REGION
>
> # 7. Criar rclone.conf (não commitar este arquivo!)
> cat > rclone.conf << EOF
> [r2]
> type = s3
> provider = Cloudflare
> access_key_id = ${R2_ACCESS_KEY}
> secret_access_key = ${R2_SECRET_KEY}
> endpoint = https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com
>
> [gcs]
> type = google cloud storage
> project_number = $(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
> EOF
>
> # 8. Salvar config do Rclone no Secret Manager
> gcloud secrets create rclone-config-nyx \
>   --data-file=rclone.conf \
>   --project=$PROJECT_ID
>
> # 9. Criar Cloud Run Job do Rclone
> gcloud run jobs create r2-backup-nyx \
>   --image=rclone/rclone:latest \
>   --region=$REGION \
>   --project=$PROJECT_ID \
>   --set-secrets="/config/rclone.conf=rclone-config-nyx:latest" \
>   --args="sync,r2:${R2_BUCKET},gcs:nyx-backup/r2-images,--config,/config/rclone.conf,--progress"
>
> # 10. Agendar Cloud Run Job (toda segunda às 03h30)
> gcloud scheduler jobs create http r2-backup-weekly \
>   --schedule="30 3 * * 1" \
>   --time-zone="America/Sao_Paulo" \
>   --uri="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/r2-backup-nyx:run" \
>   --oauth-service-account-email="$(gcloud config get-value account)" \
>   --location=$REGION
>
> # 11. Testar
> gcloud scheduler jobs run firestore-backup-weekly --location=$REGION
> gcloud run jobs execute r2-backup-nyx --region=$REGION
>
> # 12. Verificar
> gcloud storage ls gs://nyx-backup/firestore/
> gcloud storage ls gs://nyx-backup/r2-images/
> ```
>
> Qualquer dúvida, chama o Cardoso.

---

Detalhamento de custos: `empresa/custos-infraestrutura.md`
