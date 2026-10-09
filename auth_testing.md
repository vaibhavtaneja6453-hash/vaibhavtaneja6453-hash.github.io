# Pain Map Auth Testing

Unified cookie-session auth for BOTH email/password and Emergent Google login.
Sessions live in `user_sessions` (field `session_token`, 7-day `expires_at`). Users live in
`users` with a custom `user_id` UUID field. All queries use `{"_id": 0}` projection.

## Admin account
- Email: vaibhavtaneja6453@gmail.com / Password: PainMap@2026 (role: admin)

## Backend API checks
```
API=https://health-dashboard-hub.preview.emergentagent.com
# Register
curl -c c.txt -X POST $API/api/auth/register -H "Content-Type: application/json" \
  -d '{"email":"t1@example.com","password":"pass1234","name":"Test","phone":"999","address":"x","emergency_contact_name":"Y","emergency_contact_phone":"888","age":30,"blood_type":"O+","conditions":""}'
# Login (admin)
curl -c c.txt -X POST $API/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"vaibhavtaneja6453@gmail.com","password":"PainMap@2026"}'
# Me
curl -b c.txt $API/api/auth/me
# Diary create / list / stats
curl -b c.txt -X POST $API/api/diary -H "Content-Type: application/json" \
  -d '{"level":"Y","severity":6,"regions":["Chest"],"descriptors":["Sharp"],"text":"","onset":"","duration":"","pattern":"","triggers":[],"related":[],"area_specific":[],"summary":"s","next_step":"n"}'
curl -b c.txt $API/api/diary
curl -b c.txt $API/api/diary/stats
# Reviews
curl $API/api/reviews
curl -b c.txt -X POST $API/api/reviews -H "Content-Type: application/json" -d '{"rating":5,"title":"Great","review":"Helped me"}'
# AI assistant
curl -X POST $API/api/assistant/chat -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"what do the colours mean?"}],"context":""}'
```

## Google session test (manual DB session)
```
mongosh --eval "use('test_database'); var u='user_'+Date.now(); db.users.insertOne({user_id:u,email:'g@example.com',name:'G',role:'patient',auth_provider:'google',created_at:new Date()}); db.user_sessions.insertOne({user_id:u,session_token:'tok_'+Date.now(),expires_at:new Date(Date.now()+7*864e5),created_at:new Date()});"
```
Then: `curl $API/api/auth/me -H "Authorization: Bearer <token>"`
