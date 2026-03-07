variable "project_name" {}
variable "environment" {}
variable "github_repo" {
  description = "The GitHub repository in format organization/repository (e.g. my-org/my-repo)"
}
variable "s3_bucket_arn" {}
variable "cloudfront_distribution_arn" {}
variable "create_oidc_provider" {
  description = "Set to true to create the GitHub OIDC provider. Only one can exist per AWS account."
  default     = true
}
