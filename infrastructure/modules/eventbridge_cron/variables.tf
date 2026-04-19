variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g. staging, production)"
}

variable "api_domain" {
  type        = string
  description = "Domain name for the backend API (CloudFront or ALB)"
}

variable "cron_secret" {
  type        = string
  description = "Secret used to authenticate the webhook"
  sensitive   = true
}

variable "schedule_expression" {
  type        = string
  description = "Cron expression for the schedule (e.g., cron(0 18 * * ? *))"
  default     = "cron(0 18 * * ? *)"
}
