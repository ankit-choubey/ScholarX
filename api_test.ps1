$base  = 'http://localhost:5005/api'
$hdrs  = @{ 'Content-Type' = 'application/json' }
$pass  = 0
$fail  = 0

function OK($msg)      { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function FAIL($msg)    { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Section($n,$t){ Write-Host "" ; Write-Host "[$n] $t" -ForegroundColor Yellow }

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ScholarX  -  API and JWT Test Suite"      -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Health check
Section 1 "Health Check  GET /health"
try {
  $r = Invoke-RestMethod 'http://localhost:5005/health' -Method GET
  if ($r.status -eq 'OK') { OK "Server healthy ($($r.timestamp))" }
  else { FAIL "Unexpected status: $($r.status)" }
} catch { FAIL "Request failed: $_" }

# 2. Register new user
Section 2 "Register  POST /api/auth/register"
try {
  $body = '{"name":"API Tester","email":"apitester@test.com","password":"TestPass@123","role":"researcher"}'
  $r    = Invoke-RestMethod "$base/auth/register" -Method POST -Headers $hdrs -Body $body
  if ($r.data.user.email -eq 'apitester@test.com') {
    OK "Registered: $($r.data.user.name)  role=$($r.data.user.role)"
  } else { FAIL "Unexpected response" }
} catch { FAIL "Register failed: $_" }

# 3. Login as Researcher
Section 3 "Login (researcher)  POST /api/auth/login"
try {
  $body     = '{"email":"researcher@scholarx.dev","password":"DevPassword@123"}'
  $r        = Invoke-RestMethod "$base/auth/login" -Method POST -Headers $hdrs -Body $body
  $resToken = $r.data.token
  $resHdrs  = @{ 'Content-Type'='application/json'; 'Authorization'="Bearer $resToken" }
  OK "Logged in: $($r.data.user.name)  role=$($r.data.user.role)"
  Write-Host "       JWT (first 50): $($resToken.Substring(0,50))..." -ForegroundColor DarkGray
} catch { FAIL "Researcher login failed: $_" }

# 4. GET /me with valid token
Section 4 "GET /api/auth/me  (valid token - expect 200)"
try {
  $r = Invoke-RestMethod "$base/auth/me" -Method GET -Headers $resHdrs
  if ($r.data.user.role -eq 'researcher') { OK "Profile returned: $($r.data.user.email)" }
  else { FAIL "Wrong user data" }
} catch { FAIL "Failed: $_" }

# 5. GET /me with NO token
Section 5 "GET /api/auth/me  (no token - expect 401)"
try {
  Invoke-RestMethod "$base/auth/me" -Method GET -Headers $hdrs | Out-Null
  FAIL "Should have returned 401 but got 200!"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { OK "Correctly blocked  HTTP $code Unauthorized" }
  else { FAIL "Expected 401, got $code" }
}

# 6. GET /me with FAKE token
Section 6 "GET /api/auth/me  (fake token - expect 401)"
try {
  $badHdrs = @{ 'Content-Type'='application/json'; 'Authorization'='Bearer thisisafaketokenthatisnotvalid.xyz.abc' }
  Invoke-RestMethod "$base/auth/me" -Method GET -Headers $badHdrs | Out-Null
  FAIL "Should have returned 401 but got 200!"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { OK "Correctly blocked  HTTP $code Unauthorized" }
  else { FAIL "Expected 401, got $code" }
}

# 7. Researcher gets own papers
Section 7 "GET /api/papers/my  (researcher - expect 200)"
try {
  $r = Invoke-RestMethod "$base/papers/my" -Method GET -Headers $resHdrs
  OK "Papers returned: $($r.data.papers.Count)"
} catch { FAIL "Failed: $_" }

# 8. Login as Editor
Section 8 "Login (editor)  POST /api/auth/login"
try {
  $body    = '{"email":"editor@scholarx.dev","password":"DevPassword@123"}'
  $r       = Invoke-RestMethod "$base/auth/login" -Method POST -Headers $hdrs -Body $body
  $edToken = $r.data.token
  $edHdrs  = @{ 'Content-Type'='application/json'; 'Authorization'="Bearer $edToken" }
  OK "Logged in: $($r.data.user.name)  role=$($r.data.user.role)"
} catch { FAIL "Editor login failed: $_" }

# 9. Editor gets overview
Section 9 "GET /api/editor/overview  (editor - expect 200)"
try {
  $r = Invoke-RestMethod "$base/editor/overview" -Method GET -Headers $edHdrs
  OK "Overview: total=$($r.data.overview.total)  submitted=$($r.data.overview.submitted)  published=$($r.data.overview.published)"
} catch { FAIL "Failed: $_" }

# 10. Researcher tries editor-only route
Section 10 "GET /api/editor/overview  (researcher - expect 403)"
try {
  Invoke-RestMethod "$base/editor/overview" -Method GET -Headers $resHdrs | Out-Null
  FAIL "Should have returned 403 but got 200!"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 403) { OK "Correctly blocked  HTTP $code Forbidden" }
  else { FAIL "Expected 403, got $code" }
}

# 11. Login as Reviewer
Section 11 "Login (reviewer)  POST /api/auth/login"
try {
  $body     = '{"email":"reviewer@scholarx.dev","password":"DevPassword@123"}'
  $r        = Invoke-RestMethod "$base/auth/login" -Method POST -Headers $hdrs -Body $body
  $revToken = $r.data.token
  $revHdrs  = @{ 'Content-Type'='application/json'; 'Authorization'="Bearer $revToken" }
  OK "Logged in: $($r.data.user.name)  role=$($r.data.user.role)"
} catch { FAIL "Reviewer login failed: $_" }

# 12. Reviewer gets assigned papers
Section 12 "GET /api/reviews/assigned  (reviewer - expect 200)"
try {
  $r = Invoke-RestMethod "$base/reviews/assigned" -Method GET -Headers $revHdrs
  OK "Assigned papers: $($r.data.papers.Count)"
} catch { FAIL "Failed: $_" }

# 13. Reviewer hits researcher-only route
Section 13 "GET /api/papers/my  (reviewer - expect 403)"
try {
  Invoke-RestMethod "$base/papers/my" -Method GET -Headers $revHdrs | Out-Null
  FAIL "Should have returned 403 but got 200!"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 403) { OK "Correctly blocked  HTTP $code Forbidden" }
  else { FAIL "Expected 403, got $code" }
}

# 14. Public route - no token needed
Section 14 "GET /api/publications  (public - no token needed)"
try {
  $r = Invoke-RestMethod "$base/publications" -Method GET -Headers $hdrs
  OK "Publications found: $($r.data.items.Count)"
} catch { FAIL "Failed: $_" }

# 15. Editor gets all papers
Section 15 "GET /api/papers  (editor - expect 200)"
try {
  $r = Invoke-RestMethod "$base/papers" -Method GET -Headers $edHdrs
  OK "All papers visible to editor: $($r.data.papers.Count)"
} catch { FAIL "Failed: $_" }

# 16. Editor gets available reviewers
Section 16 "GET /api/editor/reviewers  (editor - expect 200)"
try {
  $r = Invoke-RestMethod "$base/editor/reviewers" -Method GET -Headers $edHdrs
  OK "Reviewers available: $($r.data.reviewers.Count)"
} catch { FAIL "Failed: $_" }

# Summary
$total = $pass + $fail
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($fail -eq 0) {
  Write-Host "  ALL $total TESTS PASSED" -ForegroundColor Green
} else {
  Write-Host "  $pass/$total passed   |   $fail FAILED" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
