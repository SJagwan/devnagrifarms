output "cloudfront_domain" { value = aws_cloudfront_distribution.this.domain_name }
output "s3_bucket_arn" { value = aws_s3_bucket.this.arn }
output "cloudfront_distribution_arn" { value = aws_cloudfront_distribution.this.arn }
