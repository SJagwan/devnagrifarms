variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Environment (e.g., staging, production)"
}

variable "cors_allowed_origins" {
  type        = list(string)
  description = "List of origins allowed to make CORS requests (e.g., ['*'])"
  default     = ["*"]
}
