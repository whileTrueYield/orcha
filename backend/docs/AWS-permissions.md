# AWS IAM Permission

This is the set of permissions to be used when describing the `webapp` policy for the role used by our logic layer (EC2):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::upload-dev-orcha/*"
    },
    {
      "Sid": "VisualEditor1",
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```
