output "api_ip" { value = module.ec2.ec2_public_ip }
output "frontend_url" { value = module.frontend.cloudfront_domain }
output "db_endpoint" { value = module.rds.db_endpoint }
output "github_actions_role_arn" { value = module.github_oidc.github_actions_role_arn }
