variable "project_name" {}
variable "environment" {}
variable "vpc_id" {}
variable "isolated_subnet_ids" { type = list(string) }
variable "app_security_group_id" {}
variable "db_username" {}
variable "db_password" { sensitive = true }
variable "db_name" {
  description = "The name of the database to create"
  default     = "devnagrifarms"
}
