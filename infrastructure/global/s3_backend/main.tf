provider "aws" {
  region = "ap-south-1" # Your default region
}

variable "project_name" {
  default = "devnagrifarms"
}

# ------------------------------------------------------------------------------
# 1. S3 Bucket to Store the Terraform State File
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.project_name}-terraform-state-backend"

  # Prevent accidental deletion of this S3 bucket
  lifecycle {
    prevent_destroy = true
  }
}

# Enable versioning so you can see the history of your state and recover from mistakes
resource "aws_s3_bucket_versioning" "enabled" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption by default
resource "aws_s3_bucket_server_side_encryption_configuration" "default" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access to the state file
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 2. DynamoDB Table for State Locking
# ------------------------------------------------------------------------------
# This prevents two people (or two GitHub actions) from running 'terraform apply'
# at the exact same time and corrupting the state file.
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "${var.project_name}-terraform-state-locks"
  billing_mode = "PAY_PER_REQUEST" # Free tier friendly
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

output "state_bucket_name" {
  value       = aws_s3_bucket.terraform_state.bucket
  description = "The name of the S3 bucket to put in your backend config"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.terraform_locks.name
  description = "The name of the DynamoDB table to put in your backend config"
}
