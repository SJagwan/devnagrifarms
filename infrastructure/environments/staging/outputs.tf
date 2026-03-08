output "api_ip" { value = module.ec2.ec2_public_ip }
output "frontend_url" { value = module.frontend.cloudfront_domain }
output "db_endpoint" { value = module.rds.db_endpoint }
output "db_name" { value = var.db_name }
output "github_actions_role_arn" { value = module.github_oidc.github_actions_role_arn }

output "uploads_bucket_name" {
  value = module.s3_uploads.bucket_name
}

output "uploads_public_url" {
  value = module.s3_uploads.public_url
}

output "backend_s3_access_key" {
  value = module.s3_uploads.iam_access_key_id
}

output "backend_s3_secret_key" {
  value     = module.s3_uploads.iam_secret_access_key
  sensitive = true
}
