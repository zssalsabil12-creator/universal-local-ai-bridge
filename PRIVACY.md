# Privacy Documentation

This document describes how Universal Local AI Bridge (ULAB) handles your data and protects your privacy.

---

## Privacy Principles

ULAB is built on **privacy-first** principles:

1. **Local-First** - All processing happens on your device
2. **No Cloud Backend** - No servers, no data upload
3. **User Control** - You control what data is shared
4. **Transparency** - Clear documentation of data handling
5. **No Telemetry** - No analytics or tracking

---

## What Stays Local

### Project Data
✅ **Project Files** - Never leave your device  
✅ **Project Index** - Built and stored locally  
✅ **Search Results** - Generated locally  
✅ **Context Packages** - Created and stored locally  
✅ **Memory Entries** - Stored locally  
✅ **Operation Log** - Local audit trail  
✅ **Git Operations** - Local Git commands  
✅ **Command Execution** - Local process execution  

### Configuration
✅ **Settings** - Stored locally  
✅ **Permissions** - Local configuration  
✅ **Provider Preferences** - Local only  
✅ **UI Preferences** - Local storage  

### Temporary Data
✅ **Rollback Snapshots** - Local temporary storage  
✅ **Operation State** - In-memory, not persisted  
✅ **Cache** - Local cache only  

---

## What You Control

### Context Sharing
You decide what to send to AI:

1. **Build Context** - ULAB selects relevant files
2. **Review Selection** - You see what's included
3. **Modify Selection** - Add or remove files
4. **Copy Context** - You copy to clipboard
5. **Paste to AI** - You paste into AI chatbot

**Important**: ULAB never automatically sends data to AI. You must explicitly copy and paste.

### File Selection
You control which files are included:

- ✅ Select specific files
- ✅ Pin important files
- ✅ Exclude sensitive files
- ✅ Review before sending

### Memory Management
You control project memory:

- ✅ Add memory entries
- ✅ Edit memory entries
- ✅ Delete memory entries
- ✅ Clear all memory
- ✅ Memory stays local

---

## What Goes to AI Providers

### When You Send Context
When you intentionally send generated context to a third-party AI chatbot:

**What's Sent**:
- Selected file contents
- File paths
- Your question
- Project memory (if included)

**What's NOT Sent**:
- Entire project (unless you select all files)
- Sensitive files (blocked by ULAB)
- Operation log
- Git history
- Local configuration

### Provider Policies
**Important**: When you send context to ChatGPT, Gemini, DeepSeek, etc., that information is processed by that provider according to **their** privacy policies, not ULAB's.

**ULAB Cannot Control**:
- How AI providers store your data
- How AI providers use your data
- AI provider's data retention policies
- AI provider's sharing practices

**Recommendation**: Review the privacy policies of your chosen AI provider.

---

## Data Collection

### What ULAB Does NOT Collect
❌ **No Telemetry** - No usage tracking  
❌ **No Analytics** - No behavior analysis  
❌ **No Personal Data** - No personal information collected  
❌ **No Project Data** - No project files uploaded  
❌ **No API Keys** - No API keys collected  
❌ **No Usage Statistics** - No usage metrics  
❌ **No Error Reports** - No automatic error reporting  

### What ULAB Stores Locally
✅ **Project Index** - Local file metadata  
✅ **Context Packages** - Your saved contexts  
✅ **Memory Entries** - Your project notes  
✅ **Operation Log** - Local audit trail  
✅ **Settings** - Your preferences  
✅ **Permissions** - Your security settings  

**All local storage can be cleared at any time.**

---

## Network Activity

### ULAB Network Usage
ULAB makes **NO network requests** except:

1. **Initial Setup** (optional):
   - Download updates (if enabled)
   - Check for new versions (if enabled)

2. **User-Initiated**:
   - You copy context to AI chatbot
   - You paste into AI chatbot
   - AI chatbot makes its own requests

### No Hidden Network Activity
ULAB does NOT:
- ❌ Phone home
- ❌ Send telemetry
- ❌ Upload project data
- ❌ Sync to cloud
- ❌ Contact external servers (except optional updates)

---

## Third-Party Services

### AI Providers
When you use AI providers (ChatGPT, Gemini, etc.):

**ULAB's Role**:
- Helps you build context
- Formats context for AI
- Provides copy/paste workflow

**AI Provider's Role**:
- Processes your context
- Generates responses
- Follows their own privacy policy

**Your Responsibility**:
- Review AI provider's privacy policy
- Understand what data you're sharing
- Make informed decisions

### Browser Extensions
ULAB Chrome Extension:
- ✅ Uses Chrome Extension APIs only
- ✅ No external dependencies
- ✅ No third-party services
- ✅ Minimal permissions

---

## Data Retention

### Local Data
**Stored Until**:
- You delete it
- You clear ULAB data
- You uninstall ULAB

**What You Can Delete**:
- Project index (re-index anytime)
- Context packages (delete individually)
- Memory entries (delete individually)
- Operation log (clear anytime)
- All data (uninstall ULAB)

### AI Provider Data
**Controlled By**: AI provider's policies

**Typical Retention**:
- Chat history: Varies by provider
- Context data: Varies by provider
- Usage data: Varies by provider

**Recommendation**: Review each provider's data retention policy.

---

## Security & Privacy

### Encryption
- **Local Storage**: No encryption (local files)
- **Network**: HTTPS (when contacting AI providers)
- **Native Messaging**: Local only, no encryption needed

### Access Control
- **Project Access**: You select which projects
- **File Access**: ULAB only accesses selected projects
- **Command Execution**: Requires approval
- **Sensitive Files**: Blocked by default

### Audit Trail
- **Operation Log**: Complete audit trail
- **Timestamps**: All operations timestamped
- **User Actions**: All user actions logged
- **Local Only**: Log stays on your device

---

## Privacy Best Practices

### For Users

1. **Review Context Before Sending**
   - Check what files are included
   - Remove sensitive information
   - Understand what you're sharing

2. **Use Sensitive File Protection**
   - Keep `.env` files out of context
   - Don't include credentials
   - Block sensitive file patterns

3. **Review AI Provider Policies**
   - Read privacy policies
   - Understand data usage
   - Make informed choices

4. **Clear Data Regularly**
   - Clear operation log periodically
   - Delete unused context packages
   - Remove old memory entries

5. **Keep ULAB Updated**
   - Install security updates
   - Get privacy improvements
   - Stay protected

### For Organizations

1. **Review ULAB's Privacy Model**
   - Understand local-first approach
   - Verify no data leaves device
   - Confirm compliance requirements

2. **Control AI Provider Usage**
   - Approve AI providers
   - Review provider policies
   - Monitor data sharing

3. **Implement Data Policies**
   - Define sensitive data
   - Control context sharing
   - Audit operations

4. **Train Users**
   - Privacy best practices
   - Security awareness
   - Responsible AI usage

---

## Compliance

### GDPR Compliance
✅ **No Personal Data Collected** - ULAB doesn't collect personal data  
✅ **Local Processing** - All data stays local  
✅ **User Control** - Users control their data  
✅ **Right to Erasure** - Users can delete all data  

### CCPA Compliance
✅ **No Data Sold** - ULAB doesn't sell data  
✅ **No Data Shared** - No data shared with third parties  
✅ **Local Only** - All data stays local  
✅ **User Control** - Users control their data  

### Other Regulations
✅ **Privacy by Design** - Privacy built into architecture  
✅ **Data Minimization** - Minimal data collection  
✅ **Transparency** - Clear documentation  
✅ **User Rights** - Full user control  

---

## Privacy Incidents

### Reporting Privacy Concerns

If you have privacy concerns:

1. **Review Documentation** - Check this document
2. **Check Operation Log** - Review local operations
3. **Contact Support** - privacy@ulab.dev (placeholder)

### Response Process

1. **Acknowledgment**: Within 48 hours
2. **Investigation**: Within 1 week
3. **Resolution**: As needed
4. **Documentation**: Update documentation if needed

---

## Privacy Updates

### Staying Informed

1. **Read Privacy Documentation**
   - Review this document
   - Check for updates
   - Understand changes

2. **Review Release Notes**
   - Check privacy-related changes
   - Understand new features
   - Make informed decisions

3. **Monitor Network Activity**
   - Use network monitoring tools
   - Verify no unexpected connections
   - Report suspicious activity

---

## Data Flow Diagram

```
User's Device
    ↓
[ULAB Extension]
    ↓
[Local Agent]
    ↓
[Project Files] ← Never leaves device
    ↓
[Context Generation] ← Local processing
    ↓
[User Review] ← User control
    ↓
[User Copies] ← User action
    ↓
[AI Provider] ← User's choice
    ↓
[AI Response] ← Provider's service
```

**Key Points**:
- Project files never leave device
- Context generation is local
- User controls what's shared
- AI provider is user's choice

---

## Privacy Checklist

Before using ULAB, verify:

- [ ] Understand local-first model
- [ ] Review AI provider policies
- [ ] Know what data stays local
- [ ] Know what data you share
- [ ] Understand sensitive file protection
- [ ] Know how to clear data
- [ ] Review operation log regularly
- [ ] Keep ULAB updated

---

## Contact

**Privacy Questions**: privacy@ulab.dev (placeholder)  
**Security Issues**: security@ulab.dev (placeholder)  
**General Support**: support@ulab.dev (placeholder)  

---

## Third-Party Notices

### Open Source Licenses
ULAB uses open source software. See [LICENSE](LICENSE) for details.

### AI Providers
AI providers have their own terms and privacy policies. Review them before use.

### Browser Extensions
Chrome Extension APIs are governed by Chrome's policies.

---

**Privacy is a fundamental right. ULAB is designed to respect and protect your privacy.**
