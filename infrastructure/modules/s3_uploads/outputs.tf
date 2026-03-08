output "bucket_name" {
  description = "The name of the uploads bucket"
  value       = aws_s3_bucket.uploads.id
}

output "bucket_region" {
  description = "The region of the uploads bucket"
  value       = aws_s3_bucket.uploads.region
}

output "public_url" {
  description = "The base public URL for the bucket"
  value       = "https://${aws_s3_bucket.uploads.bucket_regional_domain_name}"
}

output "iam_access_key_id" {
  description = "The access key ID for the backend service"
  value       = aws_iam_access_key.backend_service_key.id
}

output "iam_secret_access_key" {
  description = "The secret access key for the backend service"
  value       = aws_iam_access_key.backend_service_key.secret
  sensitive   = true
}
