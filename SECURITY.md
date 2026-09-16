# Security Documentation

This document describes the security model, controls, and best practices for Universal Local AI Bridge (ULAB).

---

## Security Model

ULAB implements a **defense-in-depth** security model with multiple layers of protection:

```
AI Output (Untrusted)
    ↓
Parse & Validate
    ↓
Security Validation
    ↓
Permission Check
    ↓
Risk Classification
    ↓
User Approval (if required)
    ↓
Local Execution
```

**Key Principle**: AI output is **UNTRUSTED INPUT** and must never bypass validation.

---

## Security Controls

### 1. Command Execution Security

#### Allowlist-Based Approval
ULAB uses an allowlist approach - only approved commands can be executed:

**Low Risk (Auto-approved)**:
- `git status`, `git diff`, `git log`, `git branch`
- `ls`, `dir`, `pwd`, `echo`, `cat`, `type`
- Read-only operations

**Medium Risk (Auto-approved)**:
- `npm test`, `npm run test`
- `npm run build`, `npm run lint`, `npm run typecheck`
- `yarn test`, `yarn run build`
- `pnpm test`, `pnpm run build`

**High Risk (Requires Approval)**:
- `git commit`, `git checkout`, `git reset`
- `npm install`, `yarn install`, `pnpm install`
- File modifications

**Critical Risk (Blocked)**:
- Arbitrary shell commands
- PowerShell, cmd.exe
- System-wide operations
- Sensitive file access

#### Blocked Patterns
ULAB blocks dangerous patterns:

```javascript
// Command chaining
&&  // AND operator
||  // OR operator
;   // Command separator

// Command substitution
$(...)  // Shell substitution
`...`   // Backtick execution

// Dangerous commands
powershell  // PowerShell execution
cmd.exe     // Windows CMD
rm -rf      // Recursive delete
format      // Format command
```

#### Validation Process
Every command goes through:
1. **Pattern matching** - Check for blocked patterns
2. **Allowlist check** - Verify command is allowed
3. **Risk classification** - Determine risk level
4. **Approval requirement** - Check if approval needed
5. **Execution** - Only if all checks pass

### 2. File System Security

#### Project Root Enforcement
All operations are restricted to the selected project root:

```javascript
// Blocked: Path traversal
../secret.txt
../../etc/passwd

// Blocked: Absolute paths outside project
C:\Windows\System32
/etc/passwd

// Allowed: Within project
src/auth/login.ts
package.json
```

#### Sensitive File Protection
ULAB protects sensitive files:

**Blocked Patterns**:
- `.env`, `.env.local`, `.env.*`
- `.pem`, `.key`, `.p12`, `.pfx`
- `credentials.json`, `credentials.yaml`
- `secrets.json`, `secrets.yaml`
- `id_rsa`, `id_ed25519`, `id_dsa`
- `service-account.json`
- `*.sqlite`, `*.db`
- Certificate files

**Protection Mechanisms**:
- File access blocked
- Git commit blocked
- Context inclusion blocked
- AI context blocked

#### Path Validation
All paths are validated:
1. **Normalization** - Convert to standard format
2. **Traversal check** - Block `..` sequences
3. **Boundary check** - Verify within project root
4. **Sensitive check** - Block sensitive files
5. **Permission check** - Verify access allowed

### 3. Git Security

#### Commit Validation
Before creating commits:
1. **File validation** - Check for sensitive files
2. **Change review** - Show all changes
3. **User approval** - Explicit approval required
4. **Safe commit** - Only after approval

**Blocked**:
- Committing sensitive files
- Automatic commits
- Commits without approval

**Allowed**:
- Viewing git status
- Viewing git diff
- Creating commits (with approval)

#### No Automatic Push
ULAB never automatically pushes to remote repositories. Push operations are outside the default scope.

### 4. AI Safety

#### Untrusted Input
AI output is treated as untrusted:

```javascript
// AI suggests: "Run npm install malicious-package"
// ULAB validates:
// 1. Command is in allowlist? YES (npm install)
// 2. Risk level? HIGH
// 3. Requires approval? YES
// 4. User approves? Required

// AI suggests: "Access .env file"
// ULAB validates:
// 1. Sensitive file? YES
// 2. Blocked? YES
// 3. Result: REJECTED
```

#### Stale Patch Detection
Before applying patches:
1. **Record file hash** when patch is created
2. **Check current hash** before applying
3. **If changed**: Mark as STALE
4. **Block application** until regenerated

**Prevents**: Overwriting user changes

#### Rollback Protection
Before risky operations:
1. **Create snapshot** of affected files
2. **Associate with operation**
3. **Enable rollback** if needed
4. **Never destroy** user changes automatically

### 5. Process Security

#### Process Control
Every execution has:
- **Unique ID** - Track operations
- **Timestamps** - Start/end times
- **Duration tracking** - Monitor performance
- **Cancellation support** - Stop running processes
- **Timeout handling** - Prevent hanging
- **Output limits** - Prevent memory issues

#### Resource Limits
- **Timeout**: Default 30 seconds (configurable)
- **Output size**: Limited to prevent memory issues
- **Process count**: Monitored to prevent overload

### 6. Native Messaging Security

#### Chrome Extension Security
- **Manifest V3** - Latest security model
- **Minimal permissions** - Only what's needed
- **Content scripts** - Limited to AI sites
- **Service worker** - Isolated execution

#### Native Messaging
- **Local only** - No network exposure
- **Authenticated** - Extension ID validation
- **Validated messages** - Schema validation
- **No public access** - Local communication only

---

## Security Best Practices

### For Users

1. **Review Changes Carefully**
   - Always review diffs before applying
   - Understand what changed and why
   - Don't approve changes you don't understand

2. **Use Rollback When Needed**
   - If something goes wrong, use rollback
   - Don't try to manually fix issues
   - Rollback is safe and preserves your changes

3. **Keep Sensitive Files Safe**
   - Never commit `.env` files
   - Keep credentials out of Git
   - Use environment variables

4. **Monitor Operation Log**
   - Review executed operations
   - Check for unexpected actions
   - Clear log periodically

5. **Approve High-Risk Operations Carefully**
   - Understand the command
   - Verify the working directory
   - Check the risk level

### For Developers

1. **Never Trust AI Output**
   - Always validate AI suggestions
   - Treat AI output as untrusted input
   - Implement proper validation

2. **Use Allowlists**
   - Only allow known-safe commands
   - Block dangerous patterns
   - Require approval for risky operations

3. **Implement Defense in Depth**
   - Multiple layers of validation
   - Don't rely on single check
   - Fail safe (block by default)

4. **Log Everything**
   - Track all operations
   - Include timestamps
   - Enable audit trails

5. **Test Security Controls**
   - Test path traversal attempts
   - Test command injection
   - Test sensitive file access
   - Test stale patch detection

---

## Security Testing

### Automated Tests

ULAB includes comprehensive security tests:

**Path Security**:
- Path traversal prevention
- Absolute path blocking
- Symlink escape prevention
- Project root enforcement

**Command Security**:
- Command chaining blocked
- Shell injection blocked
- PowerShell blocked
- Sensitive file access blocked

**Git Security**:
- Sensitive file commit blocked
- Approval required for commits
- No automatic push

**AI Safety**:
- Malicious command blocked
- Sensitive file access blocked
- Outside-root operation blocked
- Stale patch detection

### Manual Testing

Test these scenarios:

1. **Path Traversal**:
   - Try: `../../secret.txt`
   - Expected: BLOCKED

2. **Command Injection**:
   - Try: `echo test && rm -rf /`
   - Expected: BLOCKED

3. **Sensitive Files**:
   - Try: Access `.env`
   - Expected: BLOCKED

4. **Outside Project**:
   - Try: Access `C:\Windows\System32`
   - Expected: BLOCKED

---

## Security Incidents

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. **Email**: security@ulab.dev (placeholder)
3. **Include**:
   - Description of vulnerability
   - Steps to reproduce
   - Impact assessment
   - Suggested fix (if any)

### Response Process

1. **Acknowledgment**: Within 48 hours
2. **Assessment**: Within 1 week
3. **Fix Development**: As needed
4. **Disclosure**: After fix is available

---

## Security Updates

### Staying Secure

1. **Keep ULAB Updated**
   - Install security updates promptly
   - Check for updates regularly

2. **Review Security Documentation**
   - Read security advisories
   - Understand new threats
   - Update practices accordingly

3. **Monitor Operations**
   - Review operation log
   - Check for unusual patterns
   - Report suspicious activity

---

## Threat Model

### Threats Mitigated

1. **Command Injection**
   - Blocked by pattern matching
   - Allowlist enforcement
   - Approval requirements

2. **Path Traversal**
   - Path normalization
   - Boundary checking
   - Sensitive file protection

3. **Unauthorized Access**
   - Project root enforcement
   - Permission system
   - Approval workflow

4. **Data Exfiltration**
   - No automatic uploads
   - User-controlled context
   - Local-only processing

5. **Code Injection**
   - AI output validation
   - Stale patch detection
   - Rollback protection

### Threats Not Mitigated

1. **User Error**
   - User approves malicious changes
   - User commits sensitive files
   - **Mitigation**: Education and warnings

2. **Compromised AI Provider**
   - AI provider is compromised
   - Malicious suggestions from AI
   - **Mitigation**: User review required

3. **Local Malware**
   - Malware on user's computer
   - **Mitigation**: Standard antivirus practices

---

## Compliance

### Privacy Compliance
- **GDPR**: No personal data collected
- **CCPA**: No data sold or shared
- **Local Processing**: All data stays local

### Security Standards
- **Defense in Depth**: Multiple security layers
- **Least Privilege**: Minimal permissions
- **Fail Safe**: Block by default
- **Audit Trail**: Complete operation log

---

## Security Checklist

Before deployment, verify:

- [ ] Path traversal blocked
- [ ] Command injection blocked
- [ ] Sensitive files protected
- [ ] Project root enforced
- [ ] Approval workflow working
- [ ] Rollback functional
- [ ] Operation logging enabled
- [ ] Security tests passing
- [ ] Documentation updated
- [ ] Security review completed

---

## Contact

**Security Issues**: security@ulab.dev (placeholder)  
**General Questions**: support@ulab.dev (placeholder)  
**Documentation**: [docs/](docs/)

---

**Security is a core principle of ULAB. We take security seriously and continuously improve our security controls.**
