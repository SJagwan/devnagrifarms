variable "project_name" {}
variable "environment" {}
variable "backend_domain" {
  type        = string
  description = "The public IP or domain of the backend EC2 instance"
  default     = ""
}
