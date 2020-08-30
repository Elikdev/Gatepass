# Schema Design

## Applications

```yaml
app_name: String # required, min: 6 max: 24 chars
description: String #required
unique_id: String # required, created internally when app is registered
app_token: String # required
status: String # required
app_admins: [ObhectId, Array] # required, ref: App
```

## User(organisation)

```yaml
fullname: String # required
organisation: [ObjectId] # required, ref: Organisation
email: String # required
password: String # required
secret-question:  String #required
secret-answer:  String #required
apps: [ObjectId, Array] # optional, ref: App
confirmed: [Boolean] # default: false
role: [String] # optional, default: Owner
locations: [String, Array] # required
```

## Organisation

This model contains the following fields

```yaml
name: String # required, unique
users: [ObjectId, Array] # required, ref: User

```
