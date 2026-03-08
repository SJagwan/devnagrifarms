terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  # Note: In production, configure an S3 backend for state here
  # backend "s3" {
  #   bucket = "my-terraform-state"
  #   key    = "staging/terraform.tfstate"
  #   region = "ap-south-1"
  # }
}

provider "aws" {
  region  = var.aws_region
  profile = "devnagri"
  default_tags {
    tags = { Project = var.project_name, Environment = var.environment, ManagedBy = "Terraform" }
  }
}

module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

module "ec2" {
  source            = "../../modules/ec2"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}

module "rds" {
  source                = "../../modules/rds"
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  isolated_subnet_ids   = module.vpc.isolated_subnet_ids
  app_security_group_id = module.ec2.ec2_security_group_id
  db_username           = var.db_username
  db_password           = var.db_password
  db_name               = var.db_name
}

module "frontend" {
  source         = "../../modules/s3_cloudfront"
  project_name   = var.project_name
  environment    = var.environment
  backend_domain = module.ec2.ec2_public_dns
}

module "github_oidc" {
  source                      = "../../modules/github_oidc"
  project_name                = var.project_name
  environment                 = var.environment
  github_repo                 = var.github_repo
  s3_bucket_arn               = module.frontend.s3_bucket_arn
  cloudfront_distribution_arn = module.frontend.cloudfront_distribution_arn
}

module "s3_uploads" {
  source               = "../../modules/s3_uploads"
  project_name         = var.project_name
  environment          = var.environment
  cors_allowed_origins = ["*"] # Consider restricting to your exact frontend domain in production
}
