# Schema Design

## Applications

```yaml
app_name: String # required, min: 6 max: 24 chars
app_id: String # required, created internally when app is registered
app_users: ObjectId # required, ref: App-Users
app_token: String # required
status: String # required
description: String # required
```

## User(organisation)

```yaml
fullname: String # required
organisation_name: string # required, strictly alphanumeric with only "_" allowed
email: String # required
password: String # required
secret-question:  String #required
secret-answer:  String #required
apps: [ObjectId, Array] # optional, ref: App
confirmed: [Boolean] # default: false
role: [String] # optional, default: Owner
locations: [String, Array] # required
```

## App_Users

This model contains the following fields

```yaml
name: String # required
app_id: [ObjectId] # required, ref: App
username: [String] # required
password: [String] # optional, ref: ownerId
email: [String] # required
department: [String] # optional
status: String # required
sign_up_date: Date # required
last_login: Date # required
```
