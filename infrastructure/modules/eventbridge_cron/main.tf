resource "aws_cloudwatch_event_connection" "backend_api" {
  name               = "${var.project_name}-${var.environment}-cron-conn"
  description        = "Connection to Devnagri Farms Backend for daily cron"
  authorization_type = "API_KEY"

  auth_parameters {
    api_key {
      key   = "Authorization"
      value = "Bearer ${var.cron_secret}"
    }
  }
}

resource "aws_cloudwatch_event_api_destination" "daily_subscriptions" {
  name                             = "${var.project_name}-${var.environment}-daily-subs-dest"
  description                      = "API Destination for daily subscription processing"
  invocation_endpoint              = "https://${var.api_domain}/api/webhooks/process-daily-subscriptions"
  http_method                      = "POST"
  invocation_rate_limit_per_second = 1
  connection_arn                   = aws_cloudwatch_event_connection.backend_api.arn
}

resource "aws_cloudwatch_event_rule" "daily_cron" {
  name                = "${var.project_name}-${var.environment}-daily-cron"
  description         = "Triggers the daily subscription processing"
  schedule_expression = var.schedule_expression
}

resource "aws_iam_role" "eventbridge_invoke_api" {
  name = "${var.project_name}-${var.environment}-eb-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "invoke_api_destination" {
  name = "invoke-api-destination-policy"
  role = aws_iam_role.eventbridge_invoke_api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "events:InvokeApiDestination"
        Resource = aws_cloudwatch_event_api_destination.daily_subscriptions.arn
      }
    ]
  })
}

resource "aws_cloudwatch_event_target" "daily_subscriptions_target" {
  rule      = aws_cloudwatch_event_rule.daily_cron.name
  target_id = "daily-subscriptions-api"
  arn       = aws_cloudwatch_event_api_destination.daily_subscriptions.arn
  role_arn  = aws_iam_role.eventbridge_invoke_api.arn
}
