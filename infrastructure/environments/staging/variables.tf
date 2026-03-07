variable "aws_region" { default = "ap-south-1" }
variable "project_name" { default = "devnagrifarms" }
variable "environment" { default = "staging" }
variable "vpc_cidr" { default = "10.0.0.0/16" }
variable "db_username" { default = "admin" }
variable "db_password" { sensitive = true }
variable "github_repo" { 
  description = "The GitHub repository in format organization/repository (e.g. my-org/my-repo)"
  default     = "sjagwan/devnagrifarms" 
}
